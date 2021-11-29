const states = new Map();

const SETTINGS_DEFAULT = {
  track: true,
  once: false,
  unbind: false,
  detectHalf: false,
  emitInvisible: false,

  top: '0px',
  left: '0px',
  bottom: '0px',
  right: '0px'
};

const setState = (element, state) => {
  states.set(element, state);
};

const getState = (element) => states.get(element);

const patchState = (element, patch) => {
  const prev = getState(element);
  const next = {
    ...prev,
    ...patch,
  };
  setState(element, next);
};

const removeState = (element) => {
  states.delete(element);
};

const getInitMargins = (settings) => {
  return `${settings.top} ${settings.right} ${settings.bottom} ${settings.left}`;
};

const getObserver = (init, handler) => {
  return new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, intersectionRatio }) => {
      if (handler) {
        handler(isIntersecting, intersectionRatio);
      }
    });
  }, init);
};

const getSettings = (settings) => {
  return {
    ...SETTINGS_DEFAULT,
    ...settings,
  };
};

class DetectViewportError extends Error {
  description = '';

  constructor(message, description) {
    super();
    this.message = message;
    this.description = description;
  }
}

const getHandler = (element) => {
  return (isIntersecting, intersectionRatio) => {
    const state = getState(element);

    /** Пропускаем, если передавали once=true и callback уже вызывался один раз (стейт был удален). */
    if (!state) {
      return;
    }

    const isVisible = state.settings.detectHalf
      ? intersectionRatio >= 0.5
      : isIntersecting;

    if ((isVisible || state.settings.emitInvisible) && isVisible !== state.isVisible) {
      /** Вызываем переданный колбэк. */
      state.callback(isVisible);

      if (state.binding.value.once) {
        Directive.unbind(element, null, null, null);
        return;
      }
    }

    patchState(element, { isVisible });
  };
};

const getVNodeElement = (vnode) => vnode.elm;

export const Directive = {
  bind(element, binding) {
    const settings = { ...SETTINGS_DEFAULT, ...binding.value };
    const callback = binding.value.callback;
    const threshold = binding.value.threshold || [0, 0.5];

    if (!settings.track) {
      return;
    }
    
    if (typeof callback !== 'function') {
      throw new DetectViewportError('Параметр callback должен быть типа function.', `Передан невалидный параметр callback типа "${typeof callback}".`);
    }

    const handler = getHandler(element);
    const observer = getObserver({ threshold, rootMargin: getInitMargins(settings) }, handler);

    setState(element, {
      settings,
      binding,
      callback,
      handler,
      observer,
      isVisible: false,
    });

    observer.observe(element);
  },

  componentUpdated(el, binding, vnode, oldVnode) {
    const settings = getSettings(binding.value);
    const oldSettings = getSettings(binding.oldValue);

    if (vnode.elm !== oldVnode.elm || settings.track !== oldSettings.track) {
      Directive.unbind(getVNodeElement(oldVnode), binding, vnode, oldVnode);
      Directive.bind(getVNodeElement(vnode), binding, vnode, oldVnode);
      return;
    }

    if (settings.unbind !== oldSettings.unbind) {
      if (settings.unbind) {
        Directive.unbind(getVNodeElement(oldVnode), binding, vnode, oldVnode);
      } else {
        Directive.bind(getVNodeElement(vnode), binding, vnode, oldVnode);
      }
    }
  },

  unbind(element) {
    const state = getState(element);
    if (state) {
      state.observer.unobserve(element);
      removeState(element);
    }
  },
};

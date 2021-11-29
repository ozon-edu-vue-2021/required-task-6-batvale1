import Vue from 'vue';
import App from './App.vue';
import { Directive } from '@/directives/detect-viewport';

Vue.config.productionTip = false;

Vue.directive('detect-viewport', Directive);

new Vue({
  render: h => h(App),
}).$mount('#app')

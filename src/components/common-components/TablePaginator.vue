<template>
<div :class="$style.pagination">
  <span :class="$style.control" @click="getPage(1)">&lt;&lt;</span>
  <span :class="$style.control" @click="getPage(currentPage - 1)">&lt;</span>

  <span
    v-for="number in shownPagesNumbers"
    :key="number"
    :class="[[$style.control], { [$style.active]: currentPage === number }]"
    @click="getPage(number)"
  >
    {{ number }}
  </span>

  <span :class="$style.control" @click="getPage(currentPage + 1)">&gt;</span>
  <span :class="$style.control" @click="getPage(totalPages)">&gt;&gt;</span>
</div>
</template>
<script>
export default {
  name: 'TablePaginator',
  props: {
    totalPages: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 0
    }
  },
  computed: {
    shownPagesNumbers() {
      const { currentPage, totalPages } = this;

      if (currentPage <= 3) {
        if (totalPages < 5) {
          return Array(totalPages).fill(null).map(index => index + 1);
        }

        return [1, 2, 3, 4, 5];
      }

      if (currentPage >= totalPages - 2) {
        return [
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        ];
      }

      return [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2
      ];
    }
  },

  methods: {
    getPage (value) {
      this.$emit('get-page', value);
    }
  }
};
</script>

<style module>
.pagination {
  height: 48px;
  width: 100%;
  border-bottom: 1px solid #c8cacc;
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.control {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.control:last-of-type {
  margin-right: 0;
}

.control:hover {
  cursor: pointer;
}

.control.active {
  color: cornflowerblue;
  background: ivory;
  border: 1px solid #c8cacc;
  border-radius: 6px;
}
</style>

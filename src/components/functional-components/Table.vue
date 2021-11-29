<template>
<div class="table" ref="root" :style="rootStyle">
  <table ref="viewport" :style="viewportStyle">
    <thead ref="header">
    <table-row>
      <table-head-row
          v-for="column in columns"
          :key="column.field"
          @click="setSort(column)"
      >
        <div class="table-cell-title">
          <span>{{ column.field }}</span>
          <table-sorting-icon
              :sorting="sort.field === column.field && sort.direction"
          />
        </div>
      </table-head-row>
    </table-row>
    <table-row>
      <table-head-row
          v-for="column in columns"
          :key="column.field"
      >
        <input type="text" :value="filters[column.field]" @change="setFieldFilter($event.target.value, column)">
      </table-head-row>
    </table-row>
    </thead>
    <tbody ref="spacer" :style="spacerStyle">
      <table-row
          v-for="row in visibleItems"
          :key="row.id"
      >
        <table-cell
            v-for="column in columns"
            :key="column.field"
        >
          {{ row[column.field] }}
        </table-cell>
      </table-row>
    </tbody>
  </table>
  <div v-detect-viewport="detectViewPortSettings"></div>
  <table-paginator
      v-if="showCommonPagination"
      :total-pages="totalPages"
      :current-page="currentPage"
      @get-page="getPage"
  />
</div>
</template>

<script>
import TableSortingIcon from './TableSortingIcon';
import { FieldType, PaginationType, SortType } from '../constants';
import TablePaginator from './TablePaginator.vue';
import TableRow from './TableRow';
import TableCell from './TableCell';
import TableHeadRow from './TableHeadRow';

export default {
  name: 'Table',
  components: { TableHeadRow, TableCell, TableRow, TablePaginator, TableSortingIcon },
  props: {
    paginationOn: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Array,
      default: () => ([])
    },
    rows: {
      type: Array,
      default: () => ([])
    },
    totalPages: {
      type: Number,
      default: 1
    },
    currentPage: {
      type: Number,
      default: 1
    },
    paginationType: {
      type: String,
      default: PaginationType.Pagination,
      validator: (value) => Object.values(PaginationType).indexOf(value) !== -1
    }
  },

  data () {
    return {
      filters: {},
      sort: {
        field: null,
        direction: null // 'asc' or 'desc'
      },
      rootHeight: 400,
      rowHeight: 30,
      scrollTop: 0,
      nodePadding: 20,
      headerHeight: 0
    }
  },

  computed: {
    virtualScrollOn () {
      return this.paginationOn && this.paginationType === PaginationType.VirtualScroll;
    },
    showCommonPagination () {
      return this.paginationOn && this.paginationType === PaginationType.Pagination;
    },
    showInfinitePagination () {
      return this.paginationOn && this.paginationType === PaginationType.InfiniteScroll;
    },
    detectViewPortSettings () {
      return {
        track: this.showInfinitePagination,
        callback: () => this.$emit('get-infinite-next-page')
      }
    },
    viewportHeight() {
      if (!this.virtualScrollOn) return null;

      return this.itemCount * this.rowHeight;
    },
    startIndex() {
      if (!this.virtualScrollOn) return null;

      let startNode =
          Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;
      startNode = Math.max(0, startNode);
      return startNode;
    },
    visibleNodeCount() {
      if (!this.virtualScrollOn) return null;

      let count =
          Math.ceil(this.rootHeight / this.rowHeight) + 2 * this.nodePadding;
      count = Math.min(this.itemCount - this.startIndex, count);
      return count;
    },
    visibleItems() {
      return this.paginationType === PaginationType.VirtualScroll && this.paginationOn
          ? this.rows.slice(
          this.startIndex,
          this.startIndex + this.visibleNodeCount)
          : this.rows
    },
    itemCount() {
      return this.rows.length;
    },
    offsetY() {
      if (!this.virtualScrollOn) return null;

      return this.startIndex * this.rowHeight;
    },
    spacerStyle() {
      if (!this.virtualScrollOn) return {};

      return {
        transform: "translateY(" + this.offsetY + "px)"
      };
    },
    viewportStyle() {
      if (!this.virtualScrollOn) return {};

      return {
        overflow: "hidden",
        height: this.viewportHeight + this.headerHeight + "px",
        position: "relative"
      };
    },
    rootStyle() {
      if (!this.virtualScrollOn) return {};

      return {
        height: this.rootHeight + "px",
        overflow: "auto"
      };
    }
  },

  watch: {
    sort: {
      handler: 'emitSortUpdate',
      deep: true
    }
  },

  mounted () {
    if (this.paginationType !== PaginationType.VirtualScroll || !this.paginationOn) return;

    this.$refs.root.addEventListener(
        "scroll",
        this.handleScroll
    );
    // Calculate that initial row height dynamically
    const largestHeight = this.calculateInitialRowHeight();
    this.rowHeight = largestHeight !== undefined ? largestHeight : this.rowHeight;
    this.headerHeight = this.$refs.header.offsetHeight;
  },

  destroyed() {
    if (!this.virtualScrollOn) return;

    this.$refs.root.removeEventListener("scroll", this.handleScroll);
  },

  methods: {
    emitSortUpdate () {
      this.$emit('update:sort', {
        field: this.sort.field,
        direction: this.sort.direction,
        fieldOrderRule: this.getFieldOrderRule()
      });
    },

    setFieldFilter (value, column) {
      if (value) {
        this.$set(this.filters, column.field, value);
      } else {
        this.$delete(this.filters, column.field);
      }

      this.$emit('update:filter', {
        filters: this.filters
      })
    },

    getFieldOrderRule () {
      if (this.sort.fieldType !== FieldType.Number) return this.sort.field;

      return (obj) => {
        return parseInt(obj[this.sort.field], 10);
      }
    },

    setSort (column) {
      if (this.sort.field === column.field) {
        if (this.sort.direction === SortType.Asc) {
          this.sort.direction = SortType.Desc;
        } else if (this.sort.direction === SortType.Desc) {
          this.removeSort();
        }

        return;
      }

      this.sort.field = column.field;
      this.sort.direction = SortType.Asc;
      this.sort.fieldType = column.fieldType;
    },

    removeSort () {
      this.sort.field = null;
      this.sort.direction = null;
    },

    getPage (value) {
      this.$emit('get-page', value);
    },

    handleScroll() {
      this.scrollTop = this.$refs.root.scrollTop;
    },

    calculateInitialRowHeight() {
      const children = this.$refs.spacer.children;
      let largestHeight = 0;
      for (let i = 0; i < children.length; i++) {
        if (children[i].offsetHeight > largestHeight) {
          largestHeight = children[i].offsetHeight;
        }
      }

      return largestHeight;
    }
  }
};
</script>

<style scoped>
td, th {
  border: 1px solid grey;
}

th {
  padding: 3px;
  cursor: pointer;
}

.table-cell-title {
  display: flex;
  justify-content: space-between;
}

tbody {
  display: block;
}

thead, tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
</style>
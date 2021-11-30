<template>
<div class="">
  <h1>Functional components</h1>
  <Table
      :columns="columns"
      :rows="rows"
      :pages-per-step="pagesPerStep"
      :current-page="currentPage"
      :total-pages="totalPages"
      :pagination-on="paginationOn"
      :pagination-type="paginationType"
      @get-page="getPage"
      @get-infinite-next-page="getInfiniteNextPage"
      @change-pagination-type="changePaginationType"
      @update:sort="handleSortUpdate"
      @update:filter="handleFilterUpdate"
  />
</div>
</template>

<script>
import { getData } from '@/utils/random-data';
import { FieldType } from '@/components/constants';
import { orderBy, filter } from 'lodash/collection';
import { PaginationType } from '@/components/constants';

import Table from '@/components/functional-components/Table.vue'

// my backend xD
const mockData = getData(1000);

export default {
  name: 'FunctionalComponentsView',
  components: {
    Table
  },
  data() {
    return {
      columns: [],
      rows: [],
      overallRows: [],
      pagesPerStep: 50,
      currentPage: 1,
      totalPages: 1,
      paginationOn: true,
      paginationType: PaginationType.Pagination
    }
  },
  created () {
    this.columns = [
      { field: 'id', fieldType: FieldType.Number },
      { field: 'column1'},
      { field: 'column2' },
      { field: 'column3' }
    ];
    this.loadData([...mockData]);
  },

  methods: {
    loadData (data) {
      this.overallRows = data;
      if (this.paginationOn) {
        this.totalPages = this.overallRows.length === 0 ? 1 : Math.ceil(this.overallRows.length / this.pagesPerStep);
      } else {
        this.rows = this.overallRows;
      }

      if (this.paginationType === PaginationType.Pagination) {
        this.getPage(this.currentPage);
      } else if (this.paginationType === PaginationType.InfiniteScroll) {
        this.getInfiniteNextPage(false);
      } else if (this.paginationType === PaginationType.VirtualScroll) {
        this.rows = this.overallRows;
      }
    },

    getPage(value) {
      if (value > this.totalPages || value < 1) return;

      this.rows = this.overallRows.slice(
          (value - 1) * this.pagesPerStep,
          (value - 1) * this.pagesPerStep + this.pagesPerStep);

      this.currentPage = value;
    },

    getInfiniteNextPage (increasePage = true) {
      let newPageToSet = this.currentPage;

      if (increasePage) {
        newPageToSet = this.currentPage + 1;
      }

      if (newPageToSet > this.totalPages) {
        this.rows = this.overallRows;
        return;
      }

      this.rows = this.overallRows.slice(
          0,
          newPageToSet * this.pagesPerStep);

      if (this.currentPage !== newPageToSet) {
        this.currentPage = newPageToSet;
      }
    },

    handleSortUpdate ({ field, direction, fieldOrderRule}) {
      if (!field) {
        this.loadData([...mockData]);
      } else {
        this.loadData(orderBy([...mockData], fieldOrderRule, direction));
      }
    },

    handleFilterUpdate({ filters }) {
      const data = [...mockData];
      let result;
      const fieldsToFilter = Object.keys(filters);

      if (fieldsToFilter.length) {
        result = filter(data, (item) => {
          return fieldsToFilter.every(currentField => {
            return item[currentField].toLowerCase().search(filters[currentField].toLowerCase()) > -1;
          })
        });
      } else {
        result = data;
      }

      this.currentPage = 1;
      this.loadData(result);
    },

    changePaginationType (pagination) {
      this.paginationType = pagination;
      this.currentPage = 1;
      this.loadData([...mockData]);
    }
  }
}
</script>

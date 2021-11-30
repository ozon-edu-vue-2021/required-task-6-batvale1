// Copyright 2017-2021 Digital Asset Exchange Limited. All rights reserved.
// Use of this source code is governed by Microsoft Reference Source
// License (MS-RSL) that can be found in the LICENSE file.

<template>
<div class="arrows">
  <SortUp
      class="arrow"
      :class="{ 'is-active': sorting === SortType.Asc }"
  />
  <SortDown
      class="arrow"
      :class="{ 'is-active': sorting === SortType.Desc }"
  />
</div>
</template>

<script>
import { SortType } from '../constants';

import SortUp from "@/assets/icon-sort-up.svg";
import SortDown from "@/assets/icon-sort-down.svg";

export default {
  name: 'TableSortingIcon',

  components: {
    SortUp,
    SortDown
  },

  props: {
    sorting: {
      type: [String, Boolean],
      required: false
    }
  },

  data () {
    return {
      SortType
    }
  }
};
</script>

<style scoped>
.arrows {
  display: flex;
  justify-content: center;
  align-items: center;
}

.arrow path {
  font-size: 0;
  width: 6px;
  height: 4px;
  fill: #505060;
}

.arrow.is-active path{
   fill: #DCBE00;
}
</style>

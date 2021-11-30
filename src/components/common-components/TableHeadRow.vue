<template>
<th @click="$emit('click')">
  <slot/>
</th>

</template>
<script>
export default {
  name: 'table-head-row'
};
</script>
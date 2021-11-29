<script lang="jsx">
export default {
  name: 'table-head-row',

  functional: true,

  render (h, { scopedSlots, listeners }) {
    return <th on={{ click: () => listeners.click()}}>{scopedSlots.default()}</th>
  }
};
</script>
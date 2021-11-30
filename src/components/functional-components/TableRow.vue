<script lang="jsx">
export default {
  name: 'TableRow',

  functional: true,

  render (h, { scopedSlots }) {
    return <tr>{scopedSlots.default()}</tr>
  }
};
</script>
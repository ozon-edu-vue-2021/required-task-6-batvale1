<script lang="jsx">
export default {
  name: 'TableCell',

  functional: true,

  render (h, { scopedSlots }) {
    return <td>{scopedSlots.default()}</td>
  }
};
</script>
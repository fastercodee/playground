<template>
  <div class="container">
    <div class="child_1">Child 1</div>
    <div class="group">
      <div class="child_2">Child 2</div>
      <div class="child_3">Child 3</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TargetTo } from "./Layout.types"

const mode = ref<"columns" | "rows" | "bottom" | "right" | "top" | "left">()
// bottom reverse
// right reverse

const editorTo = ref<TargetTo>()
const consoleTo = ref<TargetTo>()
const previewTo = ref<TargetTo>()

const mapTargetTo = shallowReactive({
  CHILD_1: TargetTo.child_1,
  CHILD_2: TargetTo.child_2,
  CHILD_3: TargetTo.child_3,
})
// default
watch(mode, () => {
  if (
    mode.value === "columns" ||
    mode.value === "rows" ||
    mode.value === "top"
  ) {
    mapTargetTo.CHILD_1 = TargetTo.child_1
    mapTargetTo.CHILD_2 = TargetTo.child_2
    mapTargetTo.CHILD_3 = TargetTo.child_3
  }
  if (mode.value === "bottom" || mode.value === "right") {
    mapTargetTo.CHILD_2 = TargetTo.child_1
    mapTargetTo.CHILD_3 = TargetTo.child_2
    mapTargetTo.CHILD_1 = TargetTo.child_3
  }
  if (mode.value === "left") {
    mapTargetTo.CHILD_1 = TargetTo.child_1
    mapTargetTo.CHILD_2 = TargetTo.child_3
    mapTargetTo.CHILD_3 = TargetTo.child_2
  }
})
</script>

<style lang="scss" scoped>
.container {
  &.columns {
    &,
    & .group {
      @apply flex flex-nowrap;
    }
  }
  &.rows {
    &,
    & .group {
      @apply flex flex-col flex-wrap;
    }
  }
  &.bottom {
    @apply flex flex-col flex-wrap;
    .child_1 {
      order: 2;
    }
    .group {
      @apply flex flex-wrap;
      order: 1;
    }
  }
  &.right {
    @apply flex flex-wrap;
    .child_1 {
      order: 2;
    }
    .group {
      @apply flex flex-col flex-wrap;
      order: 1;
    }
  }
  &.top {
    @apply flex flex-col flex-wrap;
    .group {
      @apply flex flex-wrap;
    }
  }
  &.left {
    @apply flex flex-wrap;
    .group {
      @apply flex flex-col flex-wrap;
    }
  }
}
</style>

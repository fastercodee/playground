<template>
  <code class="ellipsis block min-w-0 w-full">
    <span>{{
      sliceBefore > 0 ? "…" + match.before.slice(sliceBefore) : match.before
    }}</span>
    <mark
      class="bg-blue-500 bg-opacity-70 text-inherit"
      :class="{
        'decoration-line-through bg-transparent': !!searchStore.replace,
      }"
      ref="markRef"
      >{{ match.match }}</mark
    >
    <span v-if="searchStore.replace" class="border border-gray-500">{{
      searchStore.replace
    }}</span>
    <span>{{ match.after }}</span>
  </code>
</template>

<script lang="ts" setup>
import type { Match } from "src/logic/search-text"

const props = defineProps<{
  match: Match
}>()

const searchStore = useSearchStore()

const sliceBefore = ref(0)

const markRef = ref<HTMLElement>()
onMounted(() => {
  if (!markRef.value) return

  const { offsetLeft: leftMark, offsetWidth: widthMark } = markRef.value
  const pointEnd = leftMark + widthMark

  const { width } = (
    markRef.value.parentNode as HTMLElement
  ).getBoundingClientRect()

  if (pointEnd > width) {
    const style = getComputedStyle(markRef.value.parentNode as HTMLElement)
    const fontSize = parseFloat(style.fontSize) / 2

    const wrongLeft =
      leftMark + (fontSize * props.match.match.length) / 2 - width / 2

    // compute correct position and count char remove

    sliceBefore.value = Math.round(wrongLeft / fontSize) + 1
  }
})
</script>

<template>
  <img v-if="source" :src="source" />
  <span v-else class="inline-block" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  src: undefined | string | Promise<string>
}>()

const source = computedAsync(() => props.src)
</script>

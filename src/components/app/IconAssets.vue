<template>
  <img :src="source" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  src: undefined | string | Promise<string>
}>()

const source = computedAsync(() => props.src)

console.log(props)
</script>

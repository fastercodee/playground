<template>
  <header class="py-2 px-3 text-12px flex justify-between">INFO</header>
  <main class="min-h-0 px-2 select-none">
    <pre>{{ sketchStore.sketchInfo }}</pre>
  </main>
</template>

<script lang="ts" setup>
const sketchStore = useSketchStore()
</script>

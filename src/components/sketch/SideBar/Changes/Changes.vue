<template>
  <header class="py-2 px-3 text-12px">CHANGES</header>
  <main class="min-h-0 h-full select-none">
    <ChangeBaseMain
      v-for="(status, fullPath) in sketchStore.変化"
      :key="fullPath"
      :opening="false"
      type="file"
      :fullpath="fullPath"
      :status="status"
    />
  </main>
</template>

<script lang="ts" setup>
const sketchStore = useSketchStore()

const tmp = sketchStore.変化
window.sketchStore = sketchStore
</script>

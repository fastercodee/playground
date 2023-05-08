<route lang="yaml">
name: sketch
alias: ["sketch/:uid(\\d+)"]
</route>

<template>
  <q-page class="flex flex-nowrap w-full w-[100vw] h-[100vh]">
    <!-- <ToolBar /> -->

    <SideBar />
    <SketchMain />
  </q-page>
</template>

<script lang="ts" setup>
const route = useRoute()
const sketchStore = useSketchStore()

if (route.params.uid ? parseInt(route.params.uid as string) > 0 : false) {
  sketchStore.fetch(parseInt(route.params.uid as string))
} else {
  sketchStore.fetch(-1, false)
}
</script>

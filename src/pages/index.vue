<route lang="yaml">
name: sketch
alias: "sketch/:uid(\\d+)?"
</route>

<template>
  <q-page class="flex flex-nowrap w-full w-[100vw] h-[100vh]">
    <!-- <ToolBar /> -->

    <SideBar />
    <SketchMain />
  </q-page>
</template>

<script lang="ts" setup>
import { AxiosError } from "axios"

const route = useRoute()
const $q = useQuasar()
const sketchStore = useSketchStore()

const loading = ref(false)
const notFound = ref(false)
const error = ref<unknown | null>(null)

// init
watch(
  () => (route.params.uid ? parseInt(route.params.uid as string) : null),
  async (uid) => {
    loading.value = true
    notFound.value = false
    error.value = null

    try {
      if (uid && uid > 0) {
        await sketchStore.fetch(uid)
      } else {
        await sketchStore.fetch(uid ?? -1, false)
      }
    } catch (err) {
      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as AxiosError<any> | void)?.response?.data.code ===
        "sketch_not_found"
      ) {
        notFound.value = true
        return
      }

      error.value = err
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)
</script>

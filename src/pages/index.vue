<route lang="yaml">
name: sketch
alias: ["sketch/:uid(\\d+)?", "new"]
</route>

<template>
  <q-page
    v-if="!notFound && !error"
    class="flex flex-nowrap w-[100vw] h-[100vh]"
  >
    <!-- <ToolBar /> -->

    <SideBar />
    <SketchMain />
  </q-page>
  <q-page v-else class="flex flex-nowrap w-[100vw] h-[100vh]">
    <div class="q-pa-md">
      <div style="font-size: 30vh">Error</div>

      <div class="text-h2" style="opacity: 0.4">{{ error }}</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { AxiosError } from "axios"

const route = useRoute()
const router = useRouter()
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
      console.warn(err)

      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as AxiosError<any> | void)?.response?.data.code ===
        "sketch_not_exists"
      ) {
        router.replace({
          name: "catch-all",
          params: {
            catchAll: route.path.slice(1).split("/"),
          },
          query: route.query,
          hash: route.hash,
        })
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

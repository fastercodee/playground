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
  <ErrorPage v-else type="Error" :message="error + ''" />
</template>

<script lang="ts" setup>
import { AxiosError } from "axios"

const route = useRoute()
const router = useRouter()
const sketchStore = useSketchStore()

const loading = ref(false)
const notFound = ref(false)
const error = ref<unknown | null>(null)

const ErrorPage = defineAsyncComponent(() => import("./[...catchAll].vue"))

// init
watch(
  () => (route.params.uid ? parseInt(route.params.uid as string) : null),
  async (uid) => {
    loading.value = true
    notFound.value = false
    error.value = null

    try {
      if (uid) {
        await sketchStore.openSketch(uid, false, async (name) => {
          console.log(name)
          return { action: "replace" }
        })
      } else {
        throw new Error("local host")
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

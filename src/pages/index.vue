<route lang="yaml">
name: sketch
alias: ["sketch/:uid(\\d+)?", "local/:uid?", "new"]
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
const $q = useQuasar()

const loading = ref(false)
const notFound = ref(false)
const error = ref<unknown | null>(null)

const ErrorPage = defineAsyncComponent(() => import("./[...catchAll].vue"))

// init
watch(
  () => [
    route.path.slice(1, route.path.indexOf("/", 2))?.toLowerCase() as
      | "sketch"
      | "local",
    decodeURIComponent((route.params.uid as string).replace(/\+/g, " ")),
  ],
  async ([type, uid]) => {
    if (!type || !uid) return

    loading.value = true
    notFound.value = false
    error.value = null

    try {
      await sketchStore.openSketch(
        type === "local" ? uid : parseInt(uid),
        type === "local",
        async (name) => {
          console.log(name)
          return { action: "new", val: name + Math.random().toString(34) }
        }
      )
    } catch (err) {
      console.warn(err)

      if (
        (err as { code: string; uid: number } | void)?.code ===
        "sketch_is_online"
      ) {
        // confirm?
        $q.dialog({
          title: "sketch is online",
          message: "sketch is online, do you want to continue?",
          ok: "Yes",
          cancel: "No",
        }).onOk(async () => {
          await router.push(
            `/sketch/${(err as { code: string; uid: number }).uid}`
          )
        })

        return
      }
      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as AxiosError<any> | void)?.response?.data.code ===
          "sketch_not_exists" ||
        (err as Error | void)?.message === "sketch_not_exists"
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

<template>
  <header class="py-2 px-3 text-12px flex justify-between">
    CHANGES
    <div>
      <Icon
        :icon="showResultAsTree ? 'codicon:list-tree' : 'codicon:list-flat'"
        class="w-16px h-16px mr-2 cursor-pointer"
        @click="showResultAsTree = !showResultAsTree"
      />
    </div>
  </header>
  <main class="min-h-0 px-2 select-none">
    <q-form v-if="auth.check()" @submit="publishChanges">
      <q-input
        v-if="!sketchStore.sketchInfo"
        filled
        debounce="500"
        v-model.trim="sketchName"
        placeholder="Sketch name"
        class="q-input--custom mt-2"
        :rules="[
          (v) => (v ? true : 'Required'),
          (v) => checkSketchName(v, auth, null),
        ]"
      />

      <q-btn
        v-if="
          !sketchStore.sketchInfo ||
          sketchStore.sketchInfo.user.uid === user?.uid
        "
        type="submit"
        rounded
        size="sm"
        class="w-full bg-green-500 bg-opacity-80 !text-12px min-h-0"
        no-caps
        :disable="notChange && !!sketchStore.sketchInfo"
        :loading="pushing"
        >{{
          sketchStore.sketchInfo ? "Save changes" : "Push new sketch"
        }}</q-btn
      >
      <q-btn
        v-else
        rounded
        size="sm"
        class="w-full bg-green-500 bg-opacity-80 !text-12px min-h-0"
        no-caps
        :loading="forking"
        @click="fork"
        >Fork sketch to save changes</q-btn
      >
    </q-form>
    <q-btn
      v-else
      rounded
      size="sm"
      class="w-full bg-green-500 bg-opacity-80 !text-12px min-h-0"
      no-caps
      to="/login"
      >Log In with to save changes</q-btn
    >
  </main>

  <section class="flex-1 min-h-0 flex flex-col flex-nowrap select-none">
    <h3
      class="px-2 text-13px text-gray-200 py-1 leading-normal mt-1 flex flex-nowrap justify-between items-center group"
      v-if="!notChange"
    >
      Stages

      <div class="hidden group-hover:!block">
        <Icon
          icon="codicon:remove"
          class="w-1.2em h-1.2em cursor-pointer"
          @click="sketchStore.removeChanges(sketchStore.変化, true)"
        />
      </div>
    </h3>
    <ChangeFlat
      v-if="!showResultAsTree"
      v-for="(status, fullPath) in sketchStore.追加された変更"
      :key="fullPath"
      staged
      type="file"
      :fullpath="fullPath"
      :status="status"
    />
    <ChangeTree
      v-else
      :meta="{ fullPath: sketchStore.rootのsketch, children: treeStages }"
      :deep-level="0"
      only-child
      staged
    />

    <h3
      class="px-2 text-13px text-gray-200 py-1 leading-normal mt-1 flex flex-nowrap justify-between items-center group"
      v-if="Object.keys(sketchStore.変化).length > 0"
    >
      Changes

      <div class="hidden group-hover:!block">
        <Icon
          icon="codicon:redo"
          :horizontalFlip="true"
          class="w-1.2em h-1.2em mr-1 cursor-pointer"
          @click="sketchStore.undoChanges(sketchStore.変化, true)"
        />
        <Icon
          icon="codicon:add"
          class="w-1.2em h-1.2em cursor-pointer"
          @click="sketchStore.addChanges(sketchStore.変化, true)"
        />
      </div>
    </h3>
    <template
      v-if="!showResultAsTree"
      v-for="(status, fullPath) in sketchStore.変化"
      :key="fullPath"
    >
      <ChangeFlat
        v-if="fullPath in sketchStore.追加された変更 === false"
        :opening="false"
        type="file"
        :fullpath="fullPath"
        :status="status"
      />
    </template>
    <ChangeTree
      v-else
      :meta="{ fullPath: sketchStore.rootのsketch, children: treeChanges }"
      :deep-level="0"
      only-child
    />
  </section>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { User } from "src/types/api/Models/User"
import { checkSketchName } from "src/validators/check-sketch-name"

const auth = useAuth()
const user = useUser<User>()
const router = useRouter()
const sketchStore = useSketchStore()
const notify = useNotify()

const treeStages = computed(() =>
  flatToTree(
    sketchStore.rootのsketch,
    new Map(Object.entries(sketchStore.追加された変更))
  )
)
const treeChanges = computed(() =>
  flatToTree(
    sketchStore.rootのsketch,
    new Map(
      Object.entries(sketchStore.変化).filter(([fullPath]) => {
        return !(fullPath in sketchStore.追加された変更)
      })
    )
  )
)

const notChange = computed<boolean>(() => {
  // eslint-disable-next-line no-unreachable-loop
  for (const _ in sketchStore.追加された変更) return false
  // eslint-disable-next-line no-unreachable-loop
  for (const _ in sketchStore.変化) return false

  return true
})

const showResultAsTree = ref(true)

const sketchName = ref("")
const emitErrorName = ref(false)
const pushing = ref(false)

async function publishChanges() {
  emitErrorName.value = true

  if (!sketchStore.sketchInfo && !sketchName.value) return

  pushing.value = true
  try {
    if (sketchStore.sketchInfo) {
      await sketchStore.pushChanges()

      notify.success("Updated files sketch")
      return
    }

    const sketchInfo = await sketchStore.publish(sketchName.value, false)

    await sketchStore.fetchAfterPublish(sketchInfo)

    await router.push(`/sketch/${sketchInfo.uid}`)

    notify.success(`Created sketch ${sketchInfo.name}`)
  } catch (err) {
    notify.error(err)
  } finally {
    pushing.value = false
  }
}

const forking = ref(false)
async function fork() {
  forking.value = true

  try {
    const sketchInfo = await sketchStore.fork(sketchName.value)
    await router.push(`/sketch/${sketchInfo.uid}`)

    notify.success("Forked sketch")
  } catch (err) {
    notify.error(err)
  } finally {
    forking.value = false
  }
}
</script>

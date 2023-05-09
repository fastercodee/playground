<template>
  <header class="py-2 px-3 text-12px flex justify-between">INFO</header>
  <q-separator />
  <main v-if="sketchInfo" class="min-h-0 py-2 px-3 select-none">
    <template v-if="!editing">
      <div class="flex flex-nowrap items-center justify-between">
        <h1 class="text-subtitle1 text-14px weight-normal">
          {{ sketchInfo.name }}
        </h1>
        <q-btn round dense @click="editing = true">
          <Icon icon="codicon:edit" width="16px" height="16px" />
        </q-btn>
      </div>
      <p class="text-gray-400">
        {{
          sketchInfo.description ?? "Add a short description for this sandbox"
        }}
      </p>
    </template>
    <q-form @submit="updateInfo" v-else>
      <q-input
        filled
        debounce="500"
        v-model.trim="name"
        placeholder="Sketch name"
        class="q-input--custom mt-2"
        :rules="[(v) => (v ? true : 'Required'), ruleCheckName]"
      />
      <div class="input-group h-auto bg-gray-700 bg-opacity-30 mt-4">
        <textarea
          v-model.trim="description"
          placeholder="Description"
          rows="4"
          class="w-full"
          @keypress.enter.prevent
        />
      </div>
      <div class="text-right text-gray-300 text-12px">0/120</div>

      <div class="flex items-center flex-nowrap mt-3">
        <q-btn
          color="transparent"
          size="11px"
          no-caps
          rounded
          class="w-full mx-1"
          @click="editing = false"
          >Cancel</q-btn
        >
        <q-btn
          color="blue"
          size="11px"
          no-caps
          rounded
          class="w-full mx-1"
          :disable="
            name === sketchInfo.name &&
            description === (sketchInfo.description ?? '')
          "
          :loading="updatingInfo"
          type="submit"
          >Update</q-btn
        >
      </div>
    </q-form>

    <div class="flex items-center mt-3">
      <q-avatar size="30px">
        <img
          :src="
            sketchInfo.user.picture ??
            `https://ui-avatars.com/api/?name=${sketchInfo.user.name}`
          "
        />
      </q-avatar>
      <div class="ml-1">
        <h2 class="py-0 my-0 leading-normal text-subtitle2">
          {{ sketchInfo.user.name }}
        </h2>
        <h3 class="py-0 my-0 leading-normal text-12px text-gray-400">
          {{ sketchInfo.user.username }}
        </h3>
      </div>
    </div>

    <!-- action -->
    <div class="flex flex-nowrap items-center children:px-2 mt-3">
      <div>
        <Icon icon="fluent:heart-24-regular" width="1.5em" height="1.5em" />
        0
      </div>

      <div>
        <Icon icon="fluent:eye-24-regular" width="1.5em" height="1.5em" />
        0
      </div>

      <div>
        <Icon
          icon="fluent:branch-fork-24-regular"
          width="1.5em"
          height="1.5em"
        />
        0
      </div>
    </div>

    <q-separator class="my-3" />

    <div class="flex items-center justify-end">
      <q-toggle v-model="sketchInfo.private" @update:model-value="
      togglePrivate
      " dense size="sm" label="Private" />
    </div>

    <q-btn
      rounded
      outline
      size="sm"
      color="green"
      class="mt-5 w-full !text-12px min-h-0"
      no-caps
      >Open Changes</q-btn
    >

    <q-btn
      rounded
      outline
      size="sm"
      color="red"
      class="mt-3 w-full !text-12px min-h-0"
      no-caps
      >Delete Sketch</q-btn
    >
  </main>
  <main v-else class="min-h-0 px-2 select-none">This sketch in a local</main>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import type { AxiosError } from "axios"
import { storeToRefs } from "pinia"

const auth = useAuth()
const sketchStore = useSketchStore()
const notify = useNotify()

const { sketchInfo } = storeToRefs(sketchStore)

const editing = ref(false)

// setup memory
const name = ref("")
const description = ref("")
watch(editing, (editing) => {
  if (!sketchInfo.value) return
  if (editing) {
    ;[name.value, description.value] = [
      sketchInfo.value?.name,
      sketchInfo.value?.description ?? "",
    ]
  }
})

async function ruleCheckName(value: string) {
  if (!sketchInfo.value) return
  if (sketchInfo.value.name === name.value) return true

  try {
    await auth.http({
      url: "/sketch/check_name",
      method: "POST",
      data: {
        uid: sketchInfo.value.uid,
        name: value,
      },
    })

    return true
  } catch (err) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as AxiosError<any>)?.response?.data?.errors?.name?.[0] ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as AxiosError<any>)?.response?.data?.message
    )
  }
}

const updatingInfo = ref(false)
async function updateInfo() {
  if (!sketchInfo.value) return

  updatingInfo.value = true

  try {
    await sketchStore.updateInfo({
      name: sketchInfo.value.name === name.value ? undefined : name.value,
      description:
        sketchInfo.value.description === description.value
          ? undefined
          : description.value,
    })
    notify.success("Info updated")
  } catch (err) {
    notify.error(err)
  } finally {
    updatingInfo.value = false
    editing.value = false
  }
}

function togglePrivate(newVal: boolean) {
  // send http
}
</script>

<template>
  <header class="py-2 px-3 text-12px flex justify-between">INFO</header>
  <main v-if="metadataのFile.data" class="min-h-0 px-3 select-none">
    <template v-if="!editing || user?.uid !== metadataのFile.data.user.uid">
      <div class="flex flex-nowrap items-center justify-between">
        <h1 class="text-subtitle1 text-14px weight-normal">
          {{ metadataのFile.data.name }}
        </h1>
        <q-btn
          v-if="metadataのFile.data.user.uid === user?.uid"
          round
          dense
          @click="editing = true"
        >
          <Icon icon="codicon:edit" width="16px" height="16px" />
        </q-btn>
      </div>
      <p class="text-gray-400">
        {{
          metadataのFile.data.description ??
          "Add a short description for this sandbox"
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
        :rules="[
          validateRequired,
          validateSketchName,
          (v) => checkSketchName(v, auth, metadataのFile.data),
        ]"
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
          size="sm"
          no-caps
          rounded
          class="w-full !text-12px mx-1"
          @click="editing = false"
          >Cancel</q-btn
        >
        <q-btn
          color="blue"
          size="sm"
          no-caps
          rounded
          class="w-full !text-12px mx-1"
          :disable="
            name === metadataのFile.data.name &&
            description === (metadataのFile.data.description ?? '')
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
            metadataのFile.data.user.picture ??
            `https://ui-avatars.com/api/?name=${metadataのFile.data.user.name}`
          "
        />
      </q-avatar>
      <div class="ml-1">
        <h2 class="py-0 my-0 leading-normal text-subtitle2">
          {{ metadataのFile.data.user.name }}
        </h2>
        <h3 class="py-0 my-0 leading-normal text-12px text-gray-400">
          {{ metadataのFile.data.user.username }}
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

    <template v-if="metadataのFile.data.user.uid === user?.uid">
      <q-separator class="my-3" />

      <div class="flex items-center justify-end">
        <q-toggle
          :model-value="metadataのFile.data.private"
          @update:model-value="togglePrivate"
          dense
          size="sm"
          label="Private"
        />
      </div>
    </template>

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
      v-if="metadataのFile.data.user.uid === user?.uid"
      rounded
      outline
      size="sm"
      color="red"
      class="mt-3 w-full !text-12px min-h-0"
      no-caps
      :loading="deleting"
      @click="deleteSketch"
      >Delete Sketch</q-btn
    >
  </main>
  <main v-else-if="sketchStore.rootのsketch" class="min-h-0 px-2 select-none">
    This sketch in a local
  </main>
  <MainOpenSketch v-else />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import { User } from "src/types/api/Models/User"
import { checkSketchName } from "src/validators/check-sketch-name"
import { validateRequired } from "src/validators/required"
import { validateSketchName } from "src/validators/validate-sketch-name"

const auth = useAuth()
const user = useUser<User>()
const sketchStore = useSketchStore()
const notify = useNotify()
const router = useRouter()
const $q = useQuasar()

const { metadataのFile } = storeToRefs(sketchStore)

const editing = ref(false)

// setup memory
const name = ref("")
const description = ref("")
watch(editing, (editing) => {
  if (!metadataのFile.value) return
  if (editing) {
    ;[name.value, description.value] = [
      metadataのFile.value.data?.name,
      metadataのFile.value.data?.description ?? "",
    ]
  }
})

const updatingInfo = ref(false)
async function updateInfo() {
  if (!metadataのFile.value.data) return

  updatingInfo.value = true

  try {
    await sketchStore.updateInfo({
      name:
        metadataのFile.value.data?.name === name.value ? undefined : name.value,
      description:
        metadataのFile.value.data?.description === description.value
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

async function togglePrivate(newVal: boolean) {
  if (!sketchStore.metadataのFile.data) return

  sketchStore.metadataのFile.data = {
    ...sketchStore.metadataのFile.data,
    private: newVal,
  }

  // send http
  try {
    await sketchStore.updateInfo({
      private: newVal ? "1" : "0",
    })
    notify.success(`Sketch updated ${newVal ? "is" : "is not"} private`)
  } catch (err) {
    if (!sketchStore.metadataのFile.data) return
    sketchStore.metadataのFile.data = {
      ...sketchStore.metadataのFile.data,
      private: !newVal,
    }
    notify.error(err)
  }
}

const deleting = ref(false)
async function deleteSketch() {
  $q.dialog({
    title: "Confirm",
    message: "Are you sure you want to delete this sketch?",
    cancel: {
      rounded: true,
      noCaps: true,
      color: "transparent",
    },
    persistent: true,
    ok: {
      label: "Delete",
      color: "negative",
      rounded: true,
      noCaps: true,
    },
  }).onOk(async () => {
    deleting.value = true

    try {
      await sketchStore.deleteSketch()
      notify.success("Sketch deleted")
      await router.push("/")
    } catch (err) {
      notify.error(err)
    } finally {
      deleting.value = false
    }
  })
}
</script>

<template>
  <div
    class="flex flex-col items-center flex-nowrap justify-between border-r border-gray-700 text-gray-500"
  >
    <div class="flex flex-col items-center flex-nowrap">
      <button
        v-for="{ icon, value, badge } in tabs"
        :key="value"
        class="w-48px h-48px hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-2px before:top-0 before:left-0"
        :class="{
          '!text-gray-200': tabSelection === value,
          'before:content-DEFAULT': tabSelection === value,
        }"
        @click="
          () => {
            if (tabSelection === value) tabSelection = null
            else tabSelection = value
          }
        "
      >
        <Icon :icon="icon" class="w-24px h-24px" />
        <q-badge
          v-if="badge && badge.value"
          floating
          rounded
          align="bottom"
          :label="badge.value"
          class="bottom-12px left-25px right-auto top-auto text-10px py-2px px-5px"
        />
      </button>

      <q-separator class="!w-[calc(100%-12px)] h-1px" />

      <button class="w-48px h-48px hover:text-gray-400 relative">
        <Icon icon="fluent:window-console-20-filled" class="w-24px h-24px" />
      </button>
      <!-- <button @click="settingsLayout = !settingsLayout">Settings Layout</button> -->
    </div>

    <div class="flex flex-col items-center flex-nowrap pb-3">
      <button
        v-if="auth.check() && user"
        class="w-48px h-48px hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-2px before:top-0 before:left-0"
      >
        <q-avatar size="27px">
          <img
            :src="
              user.picture ?? `https://ui-avatars.com/api/?name=${user.name}`
            "
          />
          {{ user }}
        </q-avatar>

        <q-menu anchor="top right" self="top left">
          <q-list class="min-w-130px">
            <q-item clickable class="min-h-0" to="/profile">
              <q-item-section>Profile</q-item-section>
            </q-item>
            <q-item clickable class="min-h-0" to="/account">
              <q-item-section>Account</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable class="min-h-0" @click="auth.logout()">
              <q-item-section>Log out</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
      <button
        v-else
        class="w-48px h-48px hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-2px before:top-0 before:left-0"
      >
        <Icon icon="codicon:account" class="w-24px h-24px" />

        <q-menu anchor="top right" self="top left">
          <q-list class="min-w-130px">
            <q-item clickable class="min-h-0" to="/login">
              <q-item-section>Log in</q-item-section>
            </q-item>
            <q-item clickable class="min-h-0" to="/signup">
              <q-item-section>Sign up</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>

      <button
        class="w-48px h-48px hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-2px before:top-0 before:left-0"
      >
        <Icon icon="codicon:settings-gear" class="w-24px h-24px" />
      </button>
    </div>
  </div>

  <Resizable
    :default-size="{
      width: '220px',
      height: 'auto',
    }"
    max-width="60%"
    min-width="1"
    :enable="{
      top: false,
      right: true,
      bottom: false,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    }"
    :class="{
      hidden: tabSelection === null,
    }"
  >
    <div
      class="h-full border-r border-gray-700 overflow-x-hidden relative flex flex-col flex-nowrap"
    >
      <KeepAlive>
        <Info v-if="!sketchStore.fetching && tabSelection === 'info'" />
      </KeepAlive>
      <KeepAlive>
        <Files v-if="sketchStore.fetching || tabSelection === 'file'" />
      </KeepAlive>
      <KeepAlive>
        <Search v-if="!sketchStore.fetching && tabSelection === 'search'" />
      </KeepAlive>
      <KeepAlive>
        <Changes v-if="!sketchStore.fetching && tabSelection === 'change'" />
      </KeepAlive>
    </div>
  </Resizable>

  <DialogSettingLayout v-model="settingsLayout" />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { User } from "src/types/api/Models/User"
import { Resizable } from "vue-re-resizable"
import "vue-re-resizable/dist/style.css"

const auth = useAuth()
const user = useUser<User>()
const sketchStore = useSketchStore()

const tabSelection = ref<
  null | "info" | "file" | "search" | "change" | "setting"
>("file")
const tabs: {
  icon: string
  value: Exclude<typeof tabSelection.value, null>
  badge?: Ref<number>
}[] = [
  {
    icon: "solar:box-minimalistic-linear",
    value: "info",
  },
  {
    icon: "codicon:files",
    value: "file",
  },
  {
    icon: "codicon:search",
    value: "search",
  },
  {
    icon: "material-symbols:cloud-sync-outline",
    value: "change",
    badge: computed(() => Object.keys(sketchStore.変化).length),
  },
]

const settingsLayout = ref(false)
</script>

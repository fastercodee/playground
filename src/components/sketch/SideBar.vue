<template>
  <div
    class="flex flex-col items-center flex-nowrap border-r border-gray-700 children:w-[48px] children:h-[48px] children:text-gray-500"
  >
    <button
      v-for="{ icon, value, badge } in tabs"
      :key="value"
      class="hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-[2px] before:top-0 before:left-0"
      :class="{
        '!text-inherit': tabSelection === value,
        'before:content-DEFAULT': tabSelection === value,
      }"
      @click="
        () => {
          if (tabSelection === value) tabSelection = null
          else tabSelection = value
        }
      "
    >
      <Icon :icon="icon" class="w-[24px] h-[24px]" />
      <q-badge
        v-if="badge && badge.value"
        floating
        rounded
        align="bottom"
        :label="badge.value"
        class="bottom-12px left-25px right-auto top-auto text-[10px] py-2px px-5px"
      />
    </button>

    <q-separator class="!w-[calc(100%-12px)] h-[1px]" />

    <button class="hover:text-gray-400 relative">
      <Icon icon="fluent:window-console-20-filled" class="w-[24px] h-[24px]" />
    </button>
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
    <div class="h-full border-r border-gray-700 overflow-x-hidden relative flex flex-col flex-nowrap">
      <KeepAlive>
        <Files v-if="tabSelection === 'file'" />
      </KeepAlive>
    </div>
  </Resizable>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { Resizable } from "vue-re-resizable"
import "vue-re-resizable/dist/style.css"

import Files from "./sidebar/Files.vue"

const tabSelection = ref<null | "file" | "search" | "change" | "setting">(
  "file"
)
const tabs: {
  icon: string
  value: Exclude<typeof tabSelection.value, null>
  badge?: Ref<number>
}[] = [
  {
    icon: "codicon:files",
    value: "file",
  },
]
</script>

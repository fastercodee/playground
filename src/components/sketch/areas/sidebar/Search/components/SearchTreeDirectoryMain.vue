<template>
  <div
    class="flex flex-nowrap items-center py-2px px-2 cursor-pointer hover:bg-[rgba(100,100,100,0.5)] transition ease duration-100"
  >
    <Icon
      :icon="`codicon:chevron-${opening ? 'down' : 'right'}`"
      class="size-17px mr-2px"
    />
    <img
      :src="
        getIcon({
          light: false,
          isFolder: type === 'directory',
          isOpen: opening,
          filepath: fullpath,
        })
      "
      class="size-[1.3em] mr-5px"
    />
    <span>{{ basename(fullpath) }}</span>
    <small
      v-if="pathdir"
      class="text-gray-400 text-12px ml-1.5 self-end truncate"
      >{{ pathdir }}</small
    >
  </div>
</template>

<script lang="ts" setup>
import { basename, dirname, relative } from "path"

import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"

const props = defineProps<{
  opening: boolean
  type: string
  fullpath: string
}>()

const pathdir = computed(() => relative("current/", dirname(props.fullpath)))
</script>

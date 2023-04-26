<template>
  <div
    class="flex flex-nowrap items-center py-2px px-2 cursor-pointer hover:bg-[rgba(100,100,100,0.5)] transition ease duration-100 group"
  >
    <div class="flex flex-nowrap items-center flex-1 min-w-0">
      <Icon
        v-if="type === 'directory'"
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
        v-if="pathdir && !modeTree"
        class="text-gray-400 text-12px ml-1.5 self-end truncate"
        >{{ pathdir }}</small
      >
    </div>

    <div class="hidden group-hover:!block">
      <Icon icon="codicon:go-to-file" class="w-1.2em h-1.2em mr-1" />
      <Icon
        icon="codicon:redo"
        :horizontalFlip="true"
        class="w-1.2em h-1.2em mr-1"
        @click="sketchStore.undoChange(fullpath, status)"
      />
      <Icon icon="codicon:add" class="w-1.2em h-1.2em"
        @click="sketchStore.addChange(fullpath, status)"/>
    </div>

    <span
      class="font-medium w-12.5px text-center inline-block"
      :class="
        {
          M: 'text-yellow-500',
          D: 'text-red-500',
          U: 'text-green-500',
        }[status]
      "
      >{{ status }}</span
    >
  </div>
</template>

<script lang="ts" setup>
import { basename, dirname, relative } from "path"

import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"
import type { Entry } from "src/logic/read-details"
import { StatusChange } from "src/stores/sketch"

const props = defineProps<{
  opening: boolean
  type: Entry<"file" | "directory">["type"]
  fullpath: string
  status: StatusChange
  modeTree?: boolean
}>()

const sketchStore = useSketchStore()

const pathdir = computed(() =>
  relative(sketchStore.rootのsketch, dirname(props.fullpath))
)
</script>

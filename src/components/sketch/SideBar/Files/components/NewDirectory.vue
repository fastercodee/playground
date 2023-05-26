<template>
  <div>
    <div class="flex flex-nowrap items-center py-2px px-2 cursor-pointer">
      <Icon
        v-if="type === 'directory'"
        :icon="`codicon:chevron-right`"
        class="size-17px mr-2px"
      />
      <IconAssets
        :src="
          getIcon({
            light: false,
            isFolder: type === 'directory',
            isOpen: false,
            filepath: name,
          })
        "
        class="size-[1.3em] mr-5px"
      />
      <EditName
        current-name=""
        newer
        :sib-directories="sibDirectories"
        :sib-files="sibFiles"
        @input="name = $event"
        @save="emit('save', name)"
        @cancel="emit('cancel')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-theme-icon/dist/getIcon"
import type { Entry } from "src/types/Entry"

defineProps<{
  type: "file" | "directory"

  sibDirectories: Record<string, Entry<"directory">>
  sibFiles: Record<string, Entry<"file">>
}>()
const emit = defineEmits<{
  (name: "save", val: string): void
  (name: "cancel"): void
}>()

const name = ref("")
</script>

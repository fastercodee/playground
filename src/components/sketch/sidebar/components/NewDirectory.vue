<template>
  <div>
    <div class="flex flex-nowrap items-center py-[2px] px-2 cursor-pointer">
      <Icon
        v-if="type === 'dir'"
        :icon="`codicon:chevron-right`"
        class="size-[17px] mr-[2px]"
      />
      <img
        :src="
          getIcon({
            light: false,
            isFolder: type === 'dir',
            isOpen: false,
            filepath: name,
          })
        "
        class="size-[1.3em] mr-[5px]"
      />
      <EditName
        current-name=""
        @input="name = $event"
        @save="emit('save', name)"
        @cancel="emit('cancel')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"

defineProps<{
  type: "file" | "dir"
}>()
const emit = defineEmits<{
  (name: "save", val: string): void
  (name: "cancel"): void
}>()

const name = ref("")
</script>

<template>
  <div class="flex flex-nowrap items-center py-[2px] px-2 cursor-pointer">
    <Icon
      v-if="entry.type === 'dir'"
      :icon="`codicon:chevron-${opening ? 'down' : 'right'}`"
      class="size-[17px] mr-[2px]"
    />
    <img
      :src="
        getIcon({
          light: false,
          isFolder: entry.type === 'dir',
          isOpen: opening,
          filepath: entry.name,
        })
      "
      class="size-[1.3em] mr-[5px]"
    />
    <span v-if="!renaming">{{ entry.name }}</span>
    <EditName
      v-else
      :current-name="entry.name"
      @save="changeName($event)"
      @cancel="renaming = false"
    />

    <!-- contextmenu -->
    <q-menu touch-position context-menu>
      <q-list dense style="min-width: 100px">
        <template
          v-for="(item, index) in [...(actions ?? []), ...contextmenu]"
          :key="index"
        >
          <q-separator v-if="item.divider" />
          <q-item v-else clickable v-close-popup @click="item.onClick">
            <q-item-section avatar class="min-w-0">
              <Icon :icon="item.icon" class="size-[14px]" />
            </q-item-section>
            <q-item-section>{{ item.name }}</q-item-section>
            <q-item-section side>{{ item.sub }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"
import type { Entry } from "src/types/Entry"

const props = defineProps<{
  opening: boolean
  entry: Entry
  // eslint-disable-next-line no-use-before-define
  actions?: typeof contextmenu
}>()
const emit = defineEmits<{
  (name: "renamed", newName: string): void
  (name: "deleted"): void
}>()

const renaming = ref(false)

// ========= contextmenu ========
const contextmenu = [
  {
    icon: "material-symbols:content-cut-rounded",
    name: "Cut",
    sub: "⌘X",
  },
  {
    icon: "material-symbols:content-copy-outline",
    name: "Copy",
    sub: "⌘C",
  },
  {
    icon: "material-symbols:content-paste",
    name: "Paste",
    sub: "⌘V",
  },
  {
    divider: true,
  },
  {
    icon: "material-symbols:drive-file-rename-outline-outline",
    name: "Rename",
    onClick() {
      renaming.value = true
    },
  },
  {
    icon: "material-symbols:delete-outline",
    name: "Delete",
    async onClick() {
      if (props.entry.type === "file") await fs.unlink(props.entry.fullPath)
      else await fs.rmdir(props.entry.fullPath, { recursive: true })

      emit("deleted")
    },
  },
]

async function changeName(name: string) {
  renaming.value =false
  await fs.rename(
    props.entry.fullPath,
    `${props.entry.directory.fullPath}/${name}`
  )

  emit("renamed", name)
}
</script>

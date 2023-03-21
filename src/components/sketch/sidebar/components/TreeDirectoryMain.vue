<template>
  <div
    class="flex flex-nowrap items-center py-[2px] px-2 cursor-pointer hover:bg-[rgba(100,100,100,0.5)] transition ease duration-100"
    :class="{
      'opacity-50': isEntryCuting(entry),
    }"
  >
    <Icon
      v-if="entry.type === 'directory'"
      :icon="`codicon:chevron-${opening ? 'down' : 'right'}`"
      class="size-[17px] mr-[2px]"
    />
    <img
      :src="
        getIcon({
          light: false,
          isFolder: entry.type === 'directory',
          isOpen: opening,
          filepath: nameInput || entry.name,
        })
      "
      class="size-[1.3em] mr-[5px]"
    />
    <span v-if="!renaming">{{ entry.name }}</span>
    <EditName
      v-else
      :current-name="entry.name"
      :sib-directories="sibDirectories"
      :sib-files="sibFiles"
      @save="
        ($event) => {
          changeName($event)
          nameInput = ''
        }
      "
      @cancel="
        () => {
          renaming = false
          nameInput = ''
        }
      "
      @input="nameInput = $event"
    />

    <!-- contextmenu -->
    <q-menu touch-position context-menu>
      <q-list dense style="min-width: 100px">
        <template
          v-for="(item, index) in [...(actions ?? []), ...contextmenu]"
          :key="index"
        >
          <q-separator v-if="item.divider" />
          <q-item
            v-else
            clickable
            v-close-popup
            @click="item.onClick"
            :disable="item.disable?.value"
          >
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
import { useClipboardFS } from "src/stores/clipboard-fs"
import type { Entry } from "src/types/Entry"

const props = defineProps<{
  opening: boolean
  entry: Entry
  // eslint-disable-next-line no-use-before-define
  actions?: typeof contextmenu

  sibDirectories: Entry<"directory">[]
  sibFiles: Entry<"file">[]
}>()
const emit = defineEmits<{
  (name: "renamed", newName: string): void
  (name: "deleted"): void
  (
    name: "child-added",
    info: {
      parent: boolean
      name: string
    }
  ): void
}>()
const { isEntryCuting } = useClipboardFS()

const renaming = ref(false)
const nameInput = ref("")

// ========= contextmenu ========
const clipboardFSStore = useClipboardFS()
const instance = getCurrentInstance()

const contextmenu = [
  {
    icon: "material-symbols:content-cut-rounded",
    name: "Cut",
    sub: "⌘X",
    onClick: cut,
  },
  {
    icon: "material-symbols:content-copy-outline",
    name: "Copy",
    sub: "⌘C",
    onClick: copy,
  },
  {
    icon: "material-symbols:content-paste",
    name: "Paste",
    sub: "⌘V",
    onClick: paste,
    disable: computed(() => !clipboardFSStore.action),
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
      if (props.entry.type === "file") {
        await Filesystem.deleteFile({
          path: props.entry.fullPath(),
          directory: Directory.External,
        })
        eventBus.emit("deleteFile", props.entry.fullPath())
      } else {
        await Filesystem.rmdir({
          path: props.entry.fullPath(),
          recursive: true,
          directory: Directory.External,
        })
        eventBus.emit("rmdir", props.entry.fullPath())
      }

      emit("deleted")
    },
  },
]

function cut() {
  clipboardFSStore.cut(props.entry, emit)
  onBeforeUnmount(() => clipboardFSStore.cancelAction(props.entry), instance)
}
function copy() {
  clipboardFSStore.copy(props.entry)
  onBeforeUnmount(() => clipboardFSStore.cancelAction(props.entry), instance)
}
async function paste() {
  const path = await clipboardFSStore.paste(props.entry as Entry<"directory">)

  emit("child-added", path)
}

async function changeName(name: string) {
  renaming.value = false

  const from = props.entry.fullPath()
  const to = `${props.entry.directory.fullPath()}/${name}`
  await Filesystem.rename({
    from,
    to,
    directory: Directory.External,
    toDirectory: Directory.External,
  })
  if (props.entry.type === "file") {
    eventBus.emit("writeFile", to)
    eventBus.emit("deleteFile", from)
  } else {
    eventBus.emit("copyDir", to)
    eventBus.emit("rmdir", from)
  }

  emit("renamed", name)
}
</script>

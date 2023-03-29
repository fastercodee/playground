<template>
  <div class="w-full">
    <div
      class="overflow-x-auto overflow-y-hidden w-full select-none whitespace-nowrap scrollbar-hide"
      ref="containerRef"
      @wheel="
        (e) => {
          containerRef?.scrollBy({
            left: e.deltaY > 0 ? 70 : -70,
            behavior: 'smooth',
          })
        }
      "
    >
      <span
        class="py-5px pl-2.5 pr-1 inline-flex items-center cursor-pointer group"
        :class="{
          'border-b border-blue-400 bg-blue-400 bg-opacity-10':
            seasonEditStore.isCurrent(entry),
        }"
        v-for="entry in seasonEditStore.seasons.keys()"
        :key="entry.fullPath()"
        @click="seasonEditStore.openFile(entry)"
      >
        <img
          :src="
            getIcon({
              light: false,
              isFolder: false,
              isOpen: false,
              filepath: entry.fullPath(),
            })
          "
          class="size-[1.3em] mr-5px"
        />
        {{ (tmp = mapName.get(entry))?.[0] ?? entry.name }}

        <span v-if="tmp?.[1]" class="opacity-80 text-[0.8em] ml-2">{{
          tmp[1]
        }}</span>
        <button
          @click.stop="seasonEditStore.closeFile(entry)"
          class="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          :style="{
            opacity: seasonEditStore.isCurrent(entry) ? 1 : '',
          }"
        >
          <Icon icon="codicon:close" class="mx-1 w-[1.2em] h-[1.2em]" />
        </button>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { basename, dirname } from "path"

import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"
import { useSeasonEdit } from "src/stores/season-edit"
import type { Entry } from "src/types/Entry"

const seasonEditStore = useSeasonEdit()

const containerRef = ref<HTMLDivElement>()

const mapName = computed(() => {
  const repeats = new Map<string, Entry<"file">[]>()
  seasonEditStore.seasons.forEach((entry) => {
    // eslint-disable-next-line functional/no-let
    let store = repeats.get(entry.name)
    if (!store) repeats.set(entry.name, (store = []))
    store.push(entry)
  })

  const names = new Map<string, Entry<"file">>()
  repeats.forEach((item) => {
    if (item.length < 2) return

    item.forEach((item) => {
      if (!names.has(item.name)) return names.set(item.name, item)
      // eslint-disable-next-line functional/no-let
      let dir = item.directory.fullPath()

      for (let i = 0; i < 20; i++) {
        const name =
          item.name +
          "|" +
          (dir.includes("/") ? "…/" : "") +
          basename(dir) +
          (i > 0 ? "/…" : "")

        if (!names.has(name)) return names.set(name, item)

        dir = dirname(dir)

        if (dir === ".") break
      }

      names.set(item.name + "|" + Math.round(Math.random() * 1000), item)
    })
  })

  return new Map(
    Array.from(names.entries()).map((item) => [item[1], item[0].split("|", 2)])
  )
})

// eslint-disable-next-line functional/no-let, @typescript-eslint/no-explicit-any
let tmp: any
</script>

<style lang="scss" scopd>
.scrollbar-hide {
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}
</style>

<template>
  <div>
    <SearchFlatMain
      type="file"
      :opening="opening"
      :fullpath="fullpath"
      :mode-tree="modeTree"
      :class="{ 'px-0': modeTree }"
      :style="styleMain"
      :count="matches.length"
      @click="opening = !opening"
      @click:close="emit('click:close')"
      @click:replace="emit('click:replace')"
    />

    <ul v-if="opening" class="text-gray-200 font-normal antialiased">
      <li
        v-for="match in matches"
        :key="`${match.posStart}-${match.posEnd}`"
        class="group flex items-center cursor-pointer hover:bg-[rgba(100,100,100,0.5)] transition ease duration-100"
        :style="styleMain"
        @click="seasonEditStore.openMatch(fullpath, match)"
      >
        <div class="px-5 group-hover:pr-3 min-w-0 flex-1">
          <SearchResultMatch :match="match" />
        </div>
        <div class="hidden group-hover:!block mr-2">
          <Icon
            icon="codicon:replace"
            class="w-1.2em h-1.2em mr-1"
            @click.stop="emit('click:replace-item', fullpath, match)"
          />
          <Icon
            icon="codicon:close"
            class="w-1.2em h-1.2em"
            @click.stop="emit('click:close-item', match)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import type { Match } from "src/logic/search-text"
import { useSeasonEdit } from "src/stores/season-edit";

defineProps<{
  fullpath: string
  matches: Match[]

  modeTree?: boolean

  styleMain?: Record<string, string>
}>()
const emit = defineEmits<{
  (name: "click:close"): void
  (name: "click:replace"): void

  (name: "click:close-item", match: Match): void
  (name: "click:replace-item", fullpath: string, match: Match): void
}>()

const seasonEditStore = useSeasonEdit()

const opening = ref(true)
</script>

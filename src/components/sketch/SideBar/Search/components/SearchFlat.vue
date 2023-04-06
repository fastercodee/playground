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
    />

    <ul v-if="opening" class="text-gray-200 font-normal antialiased">
      <li
        v-for="match in matches"
        :key="`${match.posStart}-${match.posEnd}`"
        class="cursor-pointer hover:bg-[rgba(100,100,100,0.5)] transition ease duration-100"
        :style="styleMain"
        @click="seasonEditStore.openMatch(fullpath, match)"
      >
        <div class="px-5">
          <SearchResultMatch :match="match" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { Match } from "src/logic/search-text"

defineProps<{
  fullpath: string
  matches: Match[]

  modeTree?: boolean

  styleMain?: Record<string, string>
}>()
const seasonEditStore = useSeasonEdit()

const opening = ref(true)
</script>

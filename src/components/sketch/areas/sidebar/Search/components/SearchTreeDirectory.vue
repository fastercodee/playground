<template>
  <div>
    <SearchTreeDirectoryMain
      type="file"
      :opening="opening"
      :fullpath="fullpath"
      @click="opening = !opening"
    />

    <ul v-if="opening" class="mx-3 text-gray-200 font-normal antialiased">
      <li
        v-for="match in matches"
        :key="`${match.posStart}-${match.posEnd}`"
        class="px-2 cursor-pointer hover:bg-[rgba(100,100,100,0.5)] transition ease duration-100 rounded-lg"
        @click="seasonEditStore.openMatch(fullpath, match)"
      >
        <SearchResultMatch :match="match" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { Match } from "src/logic/search-text"

defineProps<{
  fullpath: string
  matches: Match[]
}>()
const seasonEditStore = useSeasonEdit()

const opening = ref(true)
</script>

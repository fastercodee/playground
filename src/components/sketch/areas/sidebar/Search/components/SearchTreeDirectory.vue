<template>
  <div>
    <SearchTreeDirectoryMain
      type="file"
      :opening="opening"
      :fullpath="fullpath"
      @click="opening = !opening"
    />

    <ul v-if="opening" class="mx-5 text-gray-200 font-normal antialiased">
      <li v-for="match in matches" :key="`${match.posStart}-${match.posEnd}`">
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

const opening = ref(true)
</script>

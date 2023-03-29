<template>
  <header class="py-2 px-3 text-[12px] flex justify-between">
    SEARCH
    <div>
      <Icon icon="codicon:refresh" class="w-[16px] h-[16px] mr-2" />
    </div>
  </header>
  <main class="min-h-0 h-full select-none">
    <!-- search -->
    <div class="input-group">
      <input v-model="search" placeholder="Search" />
      <div class="input-action">
        <q-btn
          dense
          round
          size="sm"
          v-for="action in keywordActions"
          :key="action.icon"
        >
          <Icon :icon="action.icon" width="1.8em" height="1.8em" />
        </q-btn>
      </div>
    </div>

    <!-- replace with -->
    <div class="mt-2 flex flex-nowrap justify-between">
      <div class="input-group min-w-0">
        <input v-model="search" placeholder="Search" />
        <div class="input-action">
          <q-btn
            dense
            round
            size="sm"
            v-for="action in replaceActions"
            :key="action.icon"
          >
            <Icon :icon="action.icon" width="1.8em" height="1.8em" />
          </q-btn>
        </div>
      </div>
      <div class="mx-1 flex items-center">
        <q-btn dense round size="sm">
          <Icon icon="codicon:replace-all" width="1.8em" height="1.8em" />
        </q-btn>
      </div>
    </div>

    <!-- trigger show include, exclude -->
    <div class="flex justify-end mb--20px">
      <q-btn dense round size="sm">
        <Icon icon="ph:dots-three-bold" width="1.8em" height="1.8em" />
      </q-btn>
    </div>

    <div v-show="true">
      <!-- include -->
      <span class="mt-2 block text-gray-500 text-12px">files to include</span>
      <div class="input-group">
        <input v-model="search" placeholder="Search" />
      </div>

      <!-- exclude -->
      <span class="mt-2 block text-gray-500 text-12px">files to exclude</span>
      <div class="input-group">
        <input v-model="search" placeholder="Search" />
        <div class="input-action">
          <q-btn
            dense
            round
            size="sm"
            v-for="action in excludeActions"
            :key="action.icon"
          >
            <Icon :icon="action.icon" width="1.8em" height="1.8em" />
          </q-btn>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"

const search = ref("")

const caseSensitive = ref(false)
const wholeWord = ref(false)
const regexp = ref(false)

const preserveCase = ref(false)

const enableExclude = ref(false)

const keywordActions = [
  {
    icon: "codicon:case-sensitive",
    model: caseSensitive,
  },
  {
    icon: "codicon:whole-word",
    model: wholeWord,
  },
  {
    icon: "codicon:regex",
    model: regexp,
  },
]
const replaceActions = [
  {
    icon: "codicon:preserve-case",
    model: preserveCase,
  },
]
const excludeActions = [
  {
    icon: "codicon:exclude",
    model: enableExclude,
  },
]
</script>

<style lang="scss" scoped>
.input-group {
  @apply w-full h-[30px]  px-2 text-[13px] border border-gray-600 border-opacity-80;
  @apply flex flex-nowrap items-center justify-between;

  .input-action {
    @apply flex flex-nowrap;
  }

  input {
    @apply bg-transparent;
    min-width: 0;
    &:focus {
      @apply outline-none;
    }
  }
}
</style>

<template>
  <header class="py-2 px-3 text-12px flex justify-between">
    SEARCH
    <div>
      <Icon icon="codicon:refresh" class="w-16px h-16px" />
    </div>
  </header>
  <main class="min-h-0 h-full select-none">
    <q-linear-progress
      v-if="searching"
      indeterminate
      size="1px"
      class="absolute"
    />
    <!-- search and replace -->
    <div class="flex flex-nowrap items-center mr-2 mt-5px">
      <div @click="showReplace = !showReplace">
        <q-btn dense round size="sm">
          <Icon
            :icon="`codicon:chevron-${showReplace ? 'down' : 'right'}`"
            width="1.8em"
            height="1.8em"
          />
        </q-btn>
      </div>
      <div class="min-w-0">
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
        <div v-show="showReplace" class="mt-2 flex flex-nowrap justify-between">
          <div class="input-group min-w-0">
            <input v-model="replace" placeholder="Replace" />
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
      </div>
    </div>

    <!-- trigger show include, exclude -->
    <div
      class="flex justify-end mb--20px mr-1"
      @click="showIncludeExclude = !showIncludeExclude"
    >
      <q-btn dense round size="sm">
        <Icon icon="ph:dots-three-bold" width="1.8em" height="1.8em" />
      </q-btn>
    </div>

    <!-- include and exclude -->
    <div v-show="showIncludeExclude" class="mx-2">
      <!-- include -->
      <span class="mt-2 block text-gray-500 text-12px">files to include</span>
      <div class="input-group">
        <input v-model="include" placeholder="e.g. *.ts, src/**/include" />
      </div>

      <!-- exclude -->
      <span class="mt-2 block text-gray-500 text-12px">files to exclude</span>
      <div class="input-group">
        <input v-model="exclude" placeholder="e.g. *.ts, src/**/exlucde" />
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
import { listen, put, uuid } from "@fcanvas/communicate"
import { Icon } from "@iconify/vue"
import type { ComSearchGlob } from "src/workers/search-glob"
import SearchGlobWorker from "src/workers/search-glob?worker"

// === low state ===
const showReplace = ref(false)
const showIncludeExclude = ref(false)
// =================

const search = ref("h1")
const replace = ref("")
const include = ref("")
const exclude = ref("")

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

// ========= logic search =========
const searching = ref(false)

function splitString(str: string): string[] {
  if (!str) return []

  return str.split(",")
}
// eslint-disable-next-line no-void
void research()

async function research() {
  const worker = new SearchGlobWorker()

  if (
    import.meta.env.MODE === "development" ||
    import.meta.env.MODE === "spa" ||
    import.meta.env.MODE === "pwa"
  ) {
    searching.value = true

    const uid = uuid()

    worker.onerror = listen<ComSearchGlob, `search-return-${string}`>(
      worker,
      `search-return-${uid}`,
      (opts) => {
        console.log(opts)
      }
    )

    await put<ComSearchGlob, "search-on-spa">(
      worker,
      "search-on-spa",
      "current",
      splitString(include.value),
      enableExclude.value ? splitString(exclude.value) : [],
      uid,
      {
        search: search.value,
        caseSensitive: caseSensitive.value,
        wholeWord: wholeWord.value,
        regexp: regexp.value,
      }
    )

    searching.value = false
  }
}
</script>

<style lang="scss" scoped>
.input-group {
  @apply w-full h-30px  px-2 text-13px border border-gray-600 border-opacity-80;
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

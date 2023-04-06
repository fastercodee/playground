<template>
  <header class="py-2 px-3 text-12px flex justify-between">
    SEARCH
    <div>
      <Icon icon="codicon:refresh" class="w-16px h-16px mr-2" />
      <Icon
        icon="codicon:clear-all"
        class="w-16px h-16px mr-2"
        @click="stopSearch(), resetSearch(), resetResults()"
      />
      <Icon
        :icon="showResultAsTree ? 'codicon:list-tree' : 'codicon:list-flat'"
        @click="showResultAsTree = !showResultAsTree"
        class="w-16px h-16px mr-2"
      />
    </div>
  </header>

  <!-- optional search, mb-20px patch mb--20px in "trigger show include, exclude" -->
  <main class="min-h-0 select-none mb-20px">
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

  <section class="h-full min-h-0 flex flex-col flex-nowrap select-none">
    <span class="text-gray-400 text-13px pb-1.5 mx-3"
      >{{ metaResults.results }} results in {{ metaResults.files }} files</span
    >

    <div v-if="results.size > 0" class="h-full overflow-y-auto">
      <SearchTreeDirectory
        v-if="showResultAsTree"
        only-child
        :meta="resultsTree.dirs.get('current')!"
        :deep-level="0"
      />
      <SearchFlat
        v-else
        v-for="[fullpath, matches] in results"
        :key="fullpath"
        :fullpath="fullpath"
        :matches="matches"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { listen, put, uuid } from "@fcanvas/communicate"
import { Icon } from "@iconify/vue"
import type { Match } from "src/logic/search-text"
import type { ComSearchGlob } from "src/workers/search-glob"
import SearchGlobWorker from "src/workers/search-glob?worker"

// === low state ===
const showReplace = ref(false)
const showIncludeExclude = ref(false)
const showResultAsTree = ref(true)
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

const resetSearch = () => {
  search.value = ""
  replace.value = ""
}
// ========= logic search =========
const searching = ref(false)

function splitString(str: string): string[] {
  if (!str) return []

  return str.split(",")
}

const results = reactive<Map<string, Match[]>>(new Map())
const metaResults = shallowReactive({
  results: 0,
  files: 0,
})
const resultsTree = computed(() => flatToTree(results))
/** @description - this function only reset result. don't call stopSearch */
const resetResults = () => {
  results.clear()
  metaResults.results = 0
  metaResults.files = 0
}

// eslint-disable-next-line functional/no-let
let searchGlobWorker: Worker | null = null
// eslint-disable-next-line functional/no-let
let listenerSearchResult: (() => void) | null = null

const stopSearch = () => {
  searchGlobWorker?.terminate()
  searchGlobWorker = null
  listenerSearchResult?.()
  listenerSearchResult = null
  searching.value = false
}

// eslint-disable-next-line no-void
void research()

async function research() {
  stopSearch()
  searchGlobWorker = new SearchGlobWorker()

  resetResults()
  searching.value = true

  if (
    import.meta.env.MODE === "development" ||
    import.meta.env.MODE === "spa" ||
    import.meta.env.MODE === "pwa"
  ) {
    const uid = uuid()

    listenerSearchResult = listen<ComSearchGlob, `search-return-${string}`>(
      searchGlobWorker,
      `search-return-${uid}`,
      (opts) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        results.set(opts.file!, opts.matches)
        metaResults.files++
        metaResults.results += opts.matches.length
      }
    )
    searchGlobWorker.onerror = stopSearch

    searchGlobWorker.onmessageerror = (event) => {
      console.error("Message error: " + event)
    }

    await put<ComSearchGlob, "search-on-spa">(
      searchGlobWorker,
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

    stopSearch()
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

<template>
  <header class="py-2 px-3 text-12px flex justify-between">
    SEARCH
    <div>
      <Icon
        icon="codicon:refresh"
        class="w-16px h-16px mr-2"
        :class="search ? 'cursor-pointer' : 'text-gray-500'"
        @click="research"
      />
      <Icon
        icon="codicon:clear-all"
        class="w-16px h-16px mr-2 cursor-pointer"
        @click="stopSearch(), resetSearch(), resetResults()"
      />
      <Icon
        :icon="showResultAsTree ? 'codicon:list-tree' : 'codicon:list-flat'"
        class="w-16px h-16px mr-2"
        :class="search ? 'cursor-pointer' : 'text-gray-500'"
        @click="showResultAsTree = !showResultAsTree"
      />
    </div>
  </header>

  <!-- optional search, mb-20px patch pb--20px in "trigger show include, exclude" -->
  <main class="min-h-0 select-none pb-20px">
    <q-linear-progress
      v-if="searching || replacing"
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
              :class="{
                'text-gray-300': !action.model.value,
              }"
              @click="action.model.value = !action.model.value"
              @keypress.enter="research"
            >
              <Icon :icon="action.icon" width="1.8em" height="1.8em" />
            </q-btn>
          </div>
        </div>

        <!-- replace with -->
        <div v-show="showReplace" class="mt-2 flex flex-nowrap justify-between">
          <div class="input-group min-w-0">
            <input
              v-model="replace"
              placeholder="Replace"
              @keypress.enter="replaceMultiMatches(results).then(resetResults)"
            />
            <div class="input-action">
              <q-btn
                dense
                round
                size="sm"
                v-for="action in replaceActions"
                :key="action.icon"
                :class="{
                  'text-gray-300': !action.model.value,
                }"
                @click="action.model.value = !action.model.value"
              >
                <Icon :icon="action.icon" width="1.8em" height="1.8em" />
              </q-btn>
            </div>
          </div>
          <div class="mx-1 flex items-center">
            <q-btn
              dense
              round
              size="sm"
              @click="replaceMultiMatches(results).then(resetResults)"
            >
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
        <input
          v-model="include"
          placeholder="e.g. *.ts, src/**/include"
          @keypress.enter="research"
        />
      </div>

      <!-- exclude -->
      <span class="mt-2 block text-gray-500 text-12px">files to exclude</span>
      <div class="input-group">
        <input
          v-model="exclude"
          placeholder="e.g. *.ts, src/**/exlucde"
          @keypress.enter="research"
        />
        <div class="input-action">
          <q-btn
            dense
            round
            size="sm"
            v-for="action in excludeActions"
            :key="action.icon"
            :class="{
              'text-gray-300': !action.model.value,
            }"
            @click="action.model.value = !action.model.value"
          >
            <Icon :icon="action.icon" width="1.8em" height="1.8em" />
          </q-btn>
        </div>
      </div>
    </div>
  </main>

  <section class="flex-1 min-h-0 flex flex-col flex-nowrap select-none">
    <span v-if="search" class="text-gray-400 text-13px pb-1.5 mx-3"
      >{{ metaResults.results }} results in {{ metaResults.files }} files</span
    >

    <div v-if="results.size > 0" class="h-full overflow-y-auto">
      <SearchTreeDirectory
        v-if="showResultAsTree"
        only-child
        :meta="resultsTree.dirs.get(sketchStore.rootのsketch)!"
        :deep-level="0"
        @click:close-item="deleteResults"
        @click:close-match="deleteMatch"
      />
      <template v-else v-for="[fullpath, matches] in results" :key="fullpath">
        <SearchFlat
          v-if="matches.length > 0"
          :fullpath="fullpath"
          :matches="matches"
          @click:close-item="deleteMatch(fullpath, $event)"
          @click:replace-match="deleteMatch"
          @click:close-match="deleteMatch(fullpath, $event)"
          @click:close="deleteResults(fullpath, false)"
          @click:replace="
            replaceMatches(fullpath, matches).then(() =>
              deleteResults(fullpath, false)
            )
          "
        />
      </template>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { listen, put, uuid } from "@fcanvas/communicate"
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import { globby } from "src/logic/globby"
import {
  replaceMatches as replaceMatchesRaw,
  replaceMultiMatches as replaceMultiMatchesRaw,
} from "src/logic/replace-ctx-file"
import type { Match } from "src/logic/search-text"
import type { ComSearchGlob } from "src/workers/search-glob"
import SearchGlobWorker from "src/workers/search-glob?worker"
import type { ComSearchInText } from "src/workers/search-in-text"
import SearchInTextWorker from "src/workers/search-in-text?worker"
import type { ComSearchSingleFile } from "src/workers/search-single-file"
import SearchSingleFileWorker from "src/workers/search-single-file?worker"

const searchStore = useSearchStore()
const sketchStore = useSketchStore()

// === low state ===
const showReplace = ref(false)
const showIncludeExclude = ref(false)
const showResultAsTree = ref(true)
// =================

const search = ref("")
const { replace } = storeToRefs(searchStore)
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
const resultsTree = computed(() =>
  flatToTree(sketchStore.rootのsketch, results)
)
/** @description - this function only reset result. don't call stopSearch */
const resetResults = () => {
  results.clear()
  metaResults.results = 0
  metaResults.files = 0
}

// eslint-disable-next-line functional/no-let
let searchGloborInTextWorker: InstanceType<typeof SearchGlobWorker> | null =
  null
// eslint-disable-next-line functional/no-let
let listenerSearchResult: (() => void) | null = null

const stopSearch = () => {
  searchGloborInTextWorker?.terminate()
  searchGloborInTextWorker = null
  listenerSearchResult?.()
  listenerSearchResult = null
  searching.value = false
}
onBeforeUnmount(stopSearch)

const isWeb =
  import.meta.env.MODE === "development" ||
  import.meta.env.MODE === "spa" ||
  import.meta.env.MODE === "pwa"

watch(
  [search, include, exclude, caseSensitive, wholeWord, regexp, enableExclude],
  research
)

async function research() {
  stopSearch()
  resetResults()

  if (!search.value) return

  searching.value = true
  const searchOptions = {
    search: search.value,
    caseSensitive: caseSensitive.value,
    wholeWord: wholeWord.value,
    regexp: regexp.value,
  }

  if (isWeb) {
    const uid = uuid()

    searchGloborInTextWorker = new SearchGlobWorker()
    searchGloborInTextWorker.onerror = stopSearch
    searchGloborInTextWorker.onmessageerror = (event) => {
      console.error("Message error: " + event)
    }
    listenerSearchResult = listen<ComSearchGlob, `search-return-${string}`>(
      searchGloborInTextWorker,
      `search-return-${uid}`,
      (opts) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        results.set(opts.file!, opts.matches)
        metaResults.files++
        metaResults.results += opts.matches.length
      }
    )

    await put<ComSearchGlob, "search-on-spa">(
      searchGloborInTextWorker,
      "search-on-spa",
      sketchStore.rootのsketch,
      splitString(include.value),
      enableExclude.value ? splitString(exclude.value) : [],
      uid,
      searchOptions
    )
  } else {
    // TODO: need code

    searchGloborInTextWorker = new SearchInTextWorker()
    searchGloborInTextWorker.onerror = stopSearch
    searchGloborInTextWorker.onmessageerror = (event) => {
      console.error("Message error: " + event)
    }

    const inclu = splitString(include.value)

    for await (const file of await globby(
      sketchStore.rootのsketch,
      inclu.length === 0 ? ["**/*"] : inclu,
      splitString(exclude.value)
    )) {
      const { data: base64 } = await Filesystem.readFile({
          path: file,
          directory: Directory.External,
          encoding: Encoding.UTF8,
        })

        const uint = base64ToUint8(base64)

        if (isBinaryFile(uint)) {
          console.warn("Can't find binary file at path %s", file)
          continue
        }


      const matches = await put<ComSearchInText, "search-in-text">(
        searchGloborInTextWorker,
        "search-in-text",
        uint8ToUTF8(uint),
        searchOptions
      )

      if (matches.length === 0) continue

      results.set(file, matches)
      metaResults.files++
      metaResults.results += matches.length
    }
  }

  stopSearch()
}

// =========== watch change file and refresh search results ==========
const files = computed(() => Array.from(results.keys()))
const workersSearchSingleFile = new Set<Worker>()
const stopAllWorkersSearchSingleFile = () => {
  workersSearchSingleFile.forEach((worker) => {
    worker.terminate()
    workersSearchSingleFile.delete(worker)
  })
}
onBeforeUnmount(stopAllWorkersSearchSingleFile)
watch(files, stopAllWorkersSearchSingleFile) // not need deep watch because not add or remove item

eventBus.watch(files, async (タイプ, パス, ですか) => {
  switch (タイプ) {
    case "deleteFile":
    case "rmdir":
      results.get(ですか)?.splice(0)
      break
    case "copyDir":
    case "writeFile": {
      const searchOptions = {
        search: search.value,
        caseSensitive: caseSensitive.value,
        wholeWord: wholeWord.value,
        regexp: regexp.value,
      }

      console.log("re-search %s", ですか)
      const searchSingleFileOrInTextWorker = isWeb
        ? new SearchSingleFileWorker()
        : new SearchInTextWorker()
      workersSearchSingleFile.add(searchSingleFileOrInTextWorker)
      searchSingleFileOrInTextWorker.onmessage = () => {
        workersSearchSingleFile.delete(searchSingleFileOrInTextWorker)
        searchSingleFileOrInTextWorker.terminate()
      }
      searchSingleFileOrInTextWorker.onmessageerror = (event) => {
        console.error("Message error: " + event)
      }

      if (isWeb) {
        const matches = await put<ComSearchSingleFile, "search-single-file">(
          searchSingleFileOrInTextWorker,
          "search-single-file",
          ですか,
          searchOptions
        )
        const oldMatches = results.get(ですか)
        if (!oldMatches) console.error("oldMatches is null")
        else {
          oldMatches.splice(0)
          oldMatches.push(...matches)
        }
      } else {
        const matches = await put<ComSearchInText, "search-in-text">(
          searchSingleFileOrInTextWorker,
          "search-in-text",
          await Filesystem.readFile({
            path: ですか,
            directory: Directory.External,
            encoding: Encoding.UTF8,
          }).then((res) => res.data),
          searchOptions
        )
        const oldMatches = results.get(ですか)
        if (!oldMatches) console.error("oldMatches is null")
        else {
          oldMatches.splice(0)
          oldMatches.push(...matches)
        }
      }

      workersSearchSingleFile.delete(searchSingleFileOrInTextWorker)
      searchSingleFileOrInTextWorker.terminate()
    }
  }
})
// =====================================

// ============= replace ===========
const replacing = ref(false)
async function replaceMultiMatches(results: Map<string, Match[]>) {
  if (replacing.value) return

  replacing.value = true

  await replaceMultiMatchesRaw(results, replace.value)

  replacing.value = false
}
async function replaceMatches(fullpath: string, match: Match[]) {
  if (replacing.value) return

  replacing.value = true

  await replaceMatchesRaw(fullpath, match, replace.value)

  replacing.value = false
}

function deleteResults(fullPath: string, isDir: boolean) {
  if (!isDir) {
    const matches = results.get(fullPath)
    if (!matches) return

    results.delete(fullPath)
    metaResults.results -= matches.length
    metaResults.files--

    return
  }

  fullPath += "/"
  for (const [path, { length }] of results) {
    if (path.startsWith(fullPath)) {
      results.delete(path)
      metaResults.results -= length
      metaResults.files--
    }
  }
}
function deleteMatch(fullpath: string, match: Match) {
  const matches = results.get(fullpath)

  if (!matches) return
  matches.splice(matches.indexOf(match), 1)
  metaResults.results--

  if (matches.length === 0) deleteResults(fullpath, false)
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

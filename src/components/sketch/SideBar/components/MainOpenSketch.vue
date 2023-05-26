<template>
  <main class="min-h-0 px-2 select-none text-center">
    <q-btn
      rounded
      size="sm"
      color="blue"
      class="mt-5 !text-12px min-h-0 w-full max-w-200px"
      no-caps
      @click="openingSelectSketch = true"
      >Open</q-btn
    >
    <q-btn
      rounded
      size="sm"
      color="green"
      class="mt-3 !text-12px min-h-0 w-full max-w-200px"
      no-caps
      @click="openingNewSketch = true"
      >New</q-btn
    >
  </main>

  <q-dialog v-model="openingSelectSketch" position="top">
    <q-card style="width: 62% !important" class="min-w-0 max-w-400px">
      <q-card-section class="px-3 py-2">
        <q-input
          v-model="searchSketch"
          filled
          dense
          placeholder="Search sketch in IndexedDB"
          class="q-input--custom q-input--small w-full"
        />
        <q-list dense padding class="mt-2">
          <q-item
            v-for="dir in decevier?.filter((item) =>
              item.name.toLowerCase().includes(searchSketch.toLowerCase())
            )"
            :key="dir.dirname"
            clickable
            class="!min-h-10 !py-1"
            :to="`/local/${dir.dirname}`"
          >
            <q-item-section avatar class="min-w-0 pr-1">
              <img
                :src="
                  getIcon({
                    light: false,
                    isFolder: true,
                    isOpen: false,
                    filepath: dir.name,
                  })
                "
                class="size-[1.3em] mr-5px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ dir.fullPath }}</q-item-label>
              <q-item-label v-if="dir.metadata" caption lines="1">
                Cloud: {{ dir.metadata.name }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="dir.metadata" side>
              <Icon
                v-if="!dir.metadata.private"
                icon="ic:outline-public"
                width="1.2em"
                height="1.2em"
              />
              <Icon
                v-else
                icon="ri:git-repository-private-line"
                width="1.2em"
                height="1.2em"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="openingNewSketch">
    <q-card
      style="width: 62% !important"
      class="min-w-0 max-w-800px flex column flex-nowrap"
    >
      <q-card-section>
        <div class="text-subtitle1">Create sketch</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="px-3 py-2 h-full min-h-0 h-full scroll">
        <q-form @submit="createSketch">
          <div>
            <q-input
              v-model="nameCreateSketch"
              filled
              dense
              placeholder="Enter name sketch to save"
              class="q-input--custom w-full"
              :rules="[
                validateRequired,
                validateSketchName,
                validateSketchNameExists,
              ]"
            />
          </div>

          <ul class="row">
            <li
              class="col col-6 col-md-4 col-lg-3 col-xl-6"
              v-for="te in templates"
              :key="te.dir"
            >
              <button
                type="submit"
                @click="template = te.dir"
                class="w-full text-14px px-2 py-2 text-center flex lt-sm:column items-center hover:bg-gray-600 hover:bg-opacity-20 rounded"
              >
                <div>
                  <Icon
                    v-for="icon in te.icon.slice(0, 1)"
                    :key="icon"
                    :icon="icon"
                    width="45"
                    height="45"
                    class="mx-1"
                  />
                </div>
                <h4 class="text-gray-300">{{ te.name }}</h4>
              </button>
            </li>
          </ul>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"
import { Entry } from "src/logic/read-details"
import { getListTemplates, loadFiles } from "src/starters"
import { Sketch } from "src/types/api/Models/Sketch"
import { validateRequired } from "src/validators/required"
import { validateSketchName } from "src/validators/validate-sketch-name"

const router = useRouter()
const templates = computedAsync(() => getListTemplates())

const searchSketch = ref("")

const decevier = computedAsync(
  async () => {
    const entryRoot: Entry<"directory"> = createFakeDirectory("")
    // entryRoot.directory = entryRoot

    const { directories } = await directoryDetails(
      await readDetails<"directory">("home", entryRoot)
    )

    return Promise.all(
      Object.entries(directories).map(async ([dirname, directory]) => {
        const metadata = await Filesystem.readFile({
          path: `${directory.fullPath}/.changes/metadata`,
          directory: Directory.External,
          encoding: Encoding.UTF8,
        })
          .then((res) => JSON.parse(res.data) as Sketch<true, false>)
          .catch(() => null)

        return {
          name: directory.name,
          dirname: encodeURIComponent(dirname).replace(/%20/g, "+"),
          fullPath: directory.fullPath,
          metadata,
        }
      })
    )
  },
  undefined,
  {
    onError(e) {
      console.error(e)
    },
  }
)

const openingSelectSketch = ref(false)
const openingNewSketch = ref(false)

// eslint-disable-next-line functional/no-let
let sketches: string[]
const validateSketchNameExists = async (v: string) => {
  if (!sketches)
    sketches = await Filesystem.readdir({
      path: "home",
      directory: Directory.External,
    })
      .then((res) =>
        res.files
          .filter((item) => item.type === "directory")
          .map((item) => item.name)
      )
      .catch(() => [])

  return sketches.includes(v) ? "Sketch already exists" : true
}

const nameCreateSketch = ref("")
const template = ref("html")

const creating = ref(false)

async function createSketch() {
  if (!template.value) return
  creating.value = true

  const files = await loadFiles(template.value)
  const root = `home/${nameCreateSketch.value}`

  for (const [filepath, content] of Object.entries(files)) {
    await Filesystem.writeFile({
      path: `${root}/${filepath}`,
      data: uint8ToBase64(content),
      directory: Directory.External,
      recursive: true,
    })
  }

  await router.push(
    `/local/${encodeURIComponent(nameCreateSketch.value).replace(/%20/g, "+")}`
  )
  creating.value = false
}
</script>

<style lang="scss" scoped>
.lt-sm\:column {
  @media (max-width: $breakpoint-xs-max) {
    flex-direction: column;
  }
}
</style>

<template>
  <main class="min-h-0 px-2 select-none">Open sketch</main>

  <q-dialog :model-value="true" position="top">
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
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"
import { Entry } from "src/logic/read-details"
import { Sketch } from "src/types/api/Models/Sketch"

const searchSketch = ref("")

const appUrl = APP_URL
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
</script>

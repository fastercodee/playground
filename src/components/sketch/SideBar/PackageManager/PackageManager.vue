<template>
  <header class="py-2 px-3 text-12px flex justify-between">PACKAGES</header>
  <main v-if="sketchStore.rootのsketch" class="min-h-0 px-3 select-none">
    <q-select
      v-model="packageName"
      filled
      use-input
      dense
      hide-selected
      fill-input
      :options="options"
      :option-label="
        (item) => (isVersion(item) ? item.version : item.package.name)
      "
      @filter="filterFn"
      debounce="500"
      placeholder="Enter for add package"
      class="q-input--custom mt-2"
    >
      <template v-slot:option="scope">
        <q-item clickable @click="clickItemPackage(scope.opt)">
          <q-item-section>
            <q-item-label>
              <span :class="{ 'line-through': scope.opt.deprecated }">
                {{
                  isVersion(scope.opt)
                    ? scope.opt.version
                    : scope.opt.package.name
                }}
              </span>
            </q-item-label>
            <q-item-label
              v-if="scope.opt.package ?? scope.opt.deprecated"
              caption
              >{{
                scope.opt.package.description ?? scope.opt.deprecated
              }}</q-item-label
            >
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <h4 class="text-subtitle2 mt-5">Dependencies</h4>
    <ul>
      <li
        v-for="(version, name) in sketchStore.packageのFile.data?.dependencies"
        :key="name"
        class="flex flex-nowrap items-center justify-between px2 py-1"
      >
        <span class="block truncate min-w-0">{{ name }}</span>
        <span class="text-gray-300 flex flex-nowrap">
          <div class="truncate">
            {{ version }}
          </div>

          <q-btn
            dense
            round
            padding="0"
            class="ml-1"
            @click="delete sketchStore.packageのFile.data.dependencies![name]"
          >
            <Icon
              icon="fluent:delete-24-regular"
              width="1.3em"
              height="1.3em"
            />
          </q-btn>
        </span>
      </li>
    </ul>
  </main>
  <MainOpenSketch v-else />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"

const sketchStore = useSketchStore()

const packageName = ref()

interface NpmSearch {
  objects: {
    package: {
      name: string
      scope: string
      version: string
      description: string
      keywords: string[]
      date: string
      links: {
        npm: string
        homepage: string
        repository: string
        bugs: string
      }
      publisher: {
        username: string
        email: string
      }
      maintainers: {
        username: string
        email: string
      }[]
      author?: undefined
    }
    score: {
      final: number
      detail: {
        quality: number
        popularity: number
        maintenance: number
      }
    }
    searchScore: number
    flags?: undefined
  }[]
  total: number
  time: string
}
interface NpmPackage {
  versions: Record<
    string,
    {
      name: string
      version: string
      deprecated?: string
    }
  >
}

const isVersion = (value: any): value is NpmPackage["versions"][""] =>
  "version" in value

const options = shallowRef<
  NpmSearch["objects"] | NpmPackage["versions"][""][]
>()

const clickItemPackage = async (
  pkg: NpmSearch["objects"][0] | NpmPackage["versions"][""]
) => {
  if (isVersion(pkg)) {
    await sketchStore.packageのFile.ready

    if (!sketchStore.packageのFile.data) sketchStore.packageのFile.data = {}
    if (!sketchStore.packageのFile.data.dependencies)
      sketchStore.packageのFile.data.dependencies = {}

    sketchStore.packageのFile.data.dependencies[pkg.name] = pkg.version

    packageName.value = undefined
  } else
    options.value = await fetch(
      `https://registry.npmjs.org/${pkg.package.name}`
    )
      .then((res) => res.json() as Promise<NpmPackage>)
      .then((res) => Object.values(res.versions).reverse())
}

function filterFn(
  inputValue: string,
  doneFn: (cb: () => void) => void,
  abort: () => void
) {
  fetch(`https://registry.npmjs.org/-/v1/search?text=${inputValue}`)
    .then((res) => res.json())
    // eslint-disable-next-line promise/always-return
    .then((result: NpmSearch) => {
      doneFn(() => {
        options.value = result.objects
      })
    })
    .catch(abort)
}
</script>

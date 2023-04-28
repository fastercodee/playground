<template>
  <header class="py-2 px-3 text-12px flex justify-between">
    CHANGES
    <div>
      <Icon
        :icon="showResultAsTree ? 'codicon:list-tree' : 'codicon:list-flat'"
        class="w-16px h-16px mr-2 cursor-pointer"
        @click="showResultAsTree = !showResultAsTree"
      />
    </div>
  </header>
  <main class="min-h-0 h-full select-none">
    <div class="mx-2">
      <q-btn
        rounded
        size="sm"
        class="w-full bg-green-500 bg-opacity-80 !text-12px min-h-0"
        no-caps
        >Save stages</q-btn
      >
    </div>

    <h3
      class="px-2 text-13px text-gray-200 py-1 leading-normal mt-1 flex flex-nowrap justify-between items-center group"
      v-if="Object.keys(sketchStore.追加された変更).length > 0"
    >
      Stages

      <div class="hidden group-hover:!block">
        <Icon
          icon="codicon:remove"
          class="w-1.2em h-1.2em cursor-pointer"
          @click="sketchStore.removeChanges(sketchStore.変化, true)"
        />
      </div>
    </h3>
    <ChangeFlat
      v-if="!showResultAsTree"
      v-for="(status, fullPath) in sketchStore.追加された変更"
      :key="fullPath"
      staged
      type="file"
      :fullpath="fullPath"
      :status="status"
    />
    <ChangeTree
      v-else
      :meta="{ fullPath: sketchStore.rootのsketch, children: treeStages }"
      :deep-level="0"
      only-child
      staged
    />

    <h3
      class="px-2 text-13px text-gray-200 py-1 leading-normal mt-1 flex flex-nowrap justify-between items-center group"
      v-if="Object.keys(sketchStore.変化).length > 0"
    >
      Changes

      <div class="hidden group-hover:!block">
        <Icon
          icon="codicon:redo"
          :horizontalFlip="true"
          class="w-1.2em h-1.2em mr-1 cursor-pointer"
          @click="sketchStore.undoChanges(sketchStore.変化, true)"
        />
        <Icon
          icon="codicon:add"
          class="w-1.2em h-1.2em cursor-pointer"
          @click="sketchStore.addChanges(sketchStore.変化, true)"
        />
      </div>
    </h3>
    <template
      v-if="!showResultAsTree"
      v-for="(status, fullPath) in sketchStore.変化"
      :key="fullPath"
    >
      <ChangeFlat
        v-if="fullPath in sketchStore.追加された変更 === false"
        :opening="false"
        type="file"
        :fullpath="fullPath"
        :status="status"
      />
    </template>
    <ChangeTree
      v-else
      :meta="{ fullPath: sketchStore.rootのsketch, children: treeChanges }"
      :deep-level="0"
      only-child
    />
  </main>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"

const sketchStore = useSketchStore()

window.sketchStore = sketchStore

const treeStages = computed(() =>
  flatToTree(
    sketchStore.rootのsketch,
    new Map(Object.entries(sketchStore.追加された変更))
  )
)
const treeChanges = computed(() =>
  flatToTree(
    sketchStore.rootのsketch,
    new Map(
      Object.entries(sketchStore.変化).filter(([fullPath]) => {
        return !(fullPath in sketchStore.追加された変更)
      })
    )
  )
)

const showResultAsTree = ref(true)
</script>

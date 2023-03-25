<template>
  <div class="container overflow-hidden" :class="Mode[settingsStore.mode]">
    <Resizable
      class="area_1"
      :enable="{
        top: mode === Mode.bottom,
        right: mode === Mode.left || mode === Mode.rows,
        bottom: mode === Mode.top || mode === Mode.columns,
        left: mode === Mode.right,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }"
      :default-size="{
        width: '',
        height: '',
      }"
      min-width="0"
      max-width="100%"
      :ref="(el) => (resizableRef.area_1 = el as InstanceType<typeof Resizable>)"
    >
      <div
        class="w-full h-full"
        :ref="(el) => (targetRef.area_1 = el as HTMLDivElement)"
      />
    </Resizable>
    <div class="group min-w-0">
      <Resizable
        class="area_2"
        :enable="{
          top: false,
          right:
            mode === Mode.top || mode === Mode.bottom || mode === Mode.rows,
          bottom:
            mode === Mode.right || mode === Mode.left || mode === Mode.columns,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }"
        :default-size="{
          width: '',
          height: '',
        }"
        min-width="0"
        max-width="100%"
        :ref="(el) => (resizableRef.area_2 = el as InstanceType<typeof Resizable>)"
      >
        <div
          class="w-full h-full"
          :ref="(el) => (targetRef.area_2 = el as HTMLDivElement)"
        />
      </Resizable>
      <Resizable
        class="area_3"
        :enable="{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }"
        :default-size="{
          width: '',
          height: '',
        }"
        min-width="0"
        max-width="100%"
        :ref="(el) => (resizableRef.area_3 = el as  InstanceType<typeof Resizable>)"
      >
        <div
          class="w-full h-full"
          :ref="(el) => (targetRef.area_3 = el as HTMLDivElement)"
        />
      </Resizable>
    </div>
  </div>

  <teleport v-if="targetRef[map.Editor]" :to="targetRef[map.Editor]">
    <Editor />
  </teleport>

  <teleport v-if="targetRef[map.Preview]" :to="targetRef[map.Preview]">
    <Preview />
  </teleport>

  <teleport v-if="targetRef[map.Console]" :to="targetRef[map.Console]">
    <Console />
  </teleport>
</template>

<script lang="ts" setup>
import { Resizable } from "vue-re-resizable"

import type { Area } from "./Layout.types"
import { AreaComponent, Mode } from "./Layout.types"
import "vue-re-resizable/dist/style.css"

const settingsStore = useSettingsStore()
const mode = computed(() => settingsStore.mode)

const resizableRef = reactive<
  Record<keyof typeof Area, null | InstanceType<typeof Resizable>>
>({
  area_1: null,
  area_2: null,
  area_3: null,
})

const targetRef = reactive<Record<keyof typeof Area, null | HTMLDivElement>>({
  area_1: null,
  area_2: null,
  area_3: null,
})

// reset resize size if change mode
watch(mode, () => {
  if (resizableRef.area_1) {
    resizableRef.area_1.width = ""
    resizableRef.area_1.height = ""
  }
  if (resizableRef.area_2) {
    resizableRef.area_2.width = ""
    resizableRef.area_2.height = ""
  }
  if (resizableRef.area_3) {
    resizableRef.area_3.width = ""
    resizableRef.area_3.height = ""
  }
})

const map = computed(
  () =>
    Object.fromEntries(
      Object.entries(settingsStore.mapTargetTo).map(([key, value]) => [
        AreaComponent[value],
        key,
      ])
    ) as Record<keyof typeof AreaComponent, keyof typeof Area>
)
</script>

<style lang="scss" scoped src="./Layout.styles.scss"></style>

<style lang="scss" scoped>
.disable-resizable {
  @apply min-w-0;
  flex-shrink: 1 !important;
}
</style>

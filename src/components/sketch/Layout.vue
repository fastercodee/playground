<template>
  <div class="container w-full h-full" :class="Mode[settingsStore.mode]">

    <Resizable
      class="area_1"
      :enable="{
        top: false,
        right: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }"
      max-width="100%"
    >
    <div
      :ref="(el) => (targetRef.area_1 = el as HTMLDivElement)"
    />
    </Resizable>
    <div class="group">
      <div
        class="area_2"
        :ref="(el) => (targetRef.area_2 = el as HTMLDivElement)"
      />
      <div
        class="area_3"
        :ref="(el) => (targetRef.area_3 = el as HTMLDivElement)"
      />
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

const targetRef = reactive<Record<keyof typeof Area, null | HTMLDivElement>>({
  area_1: null,
  area_2: null,
  area_3: null,
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

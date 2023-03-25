<template>
  <div class="container" :class="Mode[settingsStore.mode]">
    <div class="area_1">Child 1</div>
    <div class="group">
      <div class="area_2">Child 2</div>
      <div class="area_3">Child 3</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Mode } from "./Layout.types"

const settingsStore = useSettingsStore()
</script>

<style lang="scss" scoped src="./Preview.styles.scss"></style>

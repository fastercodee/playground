import type { Area } from "components/sketch/SketchMain/SketchMain.types"
import {
  AreaComponent,
  Mode,
} from "components/sketch/SketchMain/SketchMain.types"
import { defineStore } from "pinia"

export const useSettingsStore = defineStore("settings", () => {
  const mode = ref<Mode>(Mode.top)
  // bottom reverse
  // right reverse

  const mapTargetTo = shallowRef<
    Readonly<Record<keyof typeof Area, AreaComponent>>
  >(getMapTargetDefault(mode.value))

  function getMapTargetDefault(
    mode: Mode
  ): Readonly<Record<keyof typeof Area, AreaComponent>> {
    if (mode === Mode.bottom || mode === Mode.right) {
      return {
        area_1: AreaComponent.Preview,
        area_2: AreaComponent.Editor,
        area_3: AreaComponent.Console,
      }
    }
    if (mode === Mode.left)
      return {
        area_1: AreaComponent.Editor,
        area_2: AreaComponent.Preview,
        area_3: AreaComponent.Console,
      }

    return {
      area_1: AreaComponent.Editor,
      area_2: AreaComponent.Console,
      area_3: AreaComponent.Preview,
    }
  }

  return { mode, mapTargetTo, getMapTargetDefault }
})

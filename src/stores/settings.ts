import { basename } from "path"

import type { Area } from "components/sketch/SketchMain/SketchMain.types"
import {
  AreaComponent,
  Mode,
} from "components/sketch/SketchMain/SketchMain.types"
import { defineStore } from "pinia"
import type TypeGetIcon from "src/assets/material-icon-theme/dist/getIcon"

const themers = Object.fromEntries(
  Object.entries(import.meta.glob("src/assets/*/dist/getIcon.ts")).map(
    ([path, module]) => [basename(path.replace("dist/getIcon.ts", "")), module]
  )
)
console.log({ themer: themers })
export const useSettingsStore = defineStore("settings", () => {
  const mode = ref<Mode>(Mode.top)

  const areaActive = reactive<Record<AreaComponent, boolean>>({
    [AreaComponent.Console]: true,
    [AreaComponent.Editor]: true,
    [AreaComponent.Preview]: true,
  })
  const countAreaActive = computed(() => {
    // eslint-disable-next-line functional/no-let
    let count = 0
    for (const val of Object.values(areaActive)) if (val) count++
    return count
  })
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

  function isModeDisabled(mode: Mode, count = countAreaActive.value): boolean {
    // if (mode === Mode.left)
    switch (count) {
      case 3:
        return false
      case 2:
        return mode !== Mode.columns && mode !== Mode.rows
      default:
        return true
    }
  }

  const fileIconTheme = ref(FILE_ICON_THEMES[1])

  const getIcon = computedAsync<typeof TypeGetIcon>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return themers[fileIconTheme.value]?.().then((res) => (res as any).default)
  })

  return {
    mode,
    countAreaActive,
    mapTargetTo,
    getMapTargetDefault,
    areaActive,
    isModeDisabled,

    fileIconTheme,
    getIcon,
  }
})

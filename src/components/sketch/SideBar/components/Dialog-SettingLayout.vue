<template>
  <q-dialog full-height>
    <q-card>
      <q-card-section>
        <div class="text-subtitle1">Setting Layout</div>
      </q-card-section>
      <q-card-section>
        <section class="row">
          <q-toggle
            dense
            size="35px"
            class="mr-5"
            v-model="areaActive[AreaComponent.Editor]"
            label="Editor"
          />
          <q-toggle
            dense
            size="35px"
            class="mr-5"
            v-model="areaActive[AreaComponent.Console]"
            label="Console"
          />
          <q-toggle
            dense
            size="35px"
            class="mr-5"
            v-model="areaActive[AreaComponent.Preview]"
            label="Preview"
          />
        </section>

        <section class="row">
          <div
            v-for="(_, value) in ModeSize"
            :key="value"
            v-memo="[value === mode, settingsStore.isModeDisabled(value)]"
            class="col-4 py-1 cursor-pointer"
            :class="{
              disabled: settingsStore.isModeDisabled(value),
            }"
            @click="
              settingsStore.isModeDisabled(value) ? false : (mode = value)
            "
          >
            <div
              class="flex items-center hover:bg-gray-100 hover:bg-opacity-10 px-3 py-2 rounded-xl transition-bg duration-100 text-[rgba(200,200,200,0.3)] hover:text-[rgba(200,200,200,0.5)]"
              :class="{
                'bg-gray-100': value === mode,
                'bg-opacity-15': value === mode,
                'text-[rgba(200,200,200,0.7)]': value === mode,
              }"
            >
              <span class="icon" :class="`icon-${Mode[value]}`" />
              <span class="ml-10px text-white capitalize font-normal">{{
                Mode[value]
              }}</span>
            </div>
          </div>
        </section>
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1">Preview</div>
        <!-- frame preview -->
        <div class="aspect-4/3 max-w-full w-340px text-center">
          <div
            class="container"
            :class="[Mode[mode], `active-${countAreaActive}`]"
          >
            <div v-if="countAreaActive > 1" class="area_1">
              <q-select
                v-model="area1"
                dense
                :options="options"
                :option-disable="optionDisable"
                :option-label="optionLabel"
              />
            </div>
            <div class="group">
              <div v-if="countAreaActive > 2" class="area_2">
                <q-select
                  v-model="area2"
                  dense
                  :options="options"
                  :option-disable="optionDisable"
                  :option-label="optionLabel"
                />
              </div>
              <div class="area_3">
                <q-select
                  v-model="area3"
                  dense
                  :options="options"
                  :option-disable="optionDisable"
                  :option-label="optionLabel"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat unelevated rounded v-close-popup>Cancel</q-btn>
        <q-btn
          flat
          unelevated
          rounded
          v-close-popup
          @click="apply"
          color="primary"
          >Apply</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {
  Area,
  AreaComponent,
  AreaComponentSize,
  Mode,
  ModeSize,
} from "components/sketch/SketchMain/SketchMain.types"

const settingsStore = useSettingsStore()

const areaActive = reactive<Record<AreaComponent, boolean>>({
  [AreaComponent.Console]: true,
  [AreaComponent.Editor]: true,
  [AreaComponent.Preview]: false,
})
const options: AreaComponent[] = Array(AreaComponentSize)
  .fill(0)
  .map((_, index) => index)
const optionLabel = (index: AreaComponent) => AreaComponent[index]
const optionDisable = (index: AreaComponent) => !areaActive[index]

const mode = ref(settingsStore.mode)
watch(
  () => settingsStore.mode,
  (value) => (mode.value = value)
)

const area1 = ref<AreaComponent>(settingsStore.mapTargetTo.area_1)
const area2 = ref<AreaComponent>(settingsStore.mapTargetTo.area_2)
const area3 = ref<AreaComponent>(settingsStore.mapTargetTo.area_3)
watchEffect(() => {
  const mapTargetTo = settingsStore.getMapTargetDefault(mode.value)
  ;[area1.value, area2.value, area3.value] = [
    mapTargetTo.area_1,
    mapTargetTo.area_2,
    mapTargetTo.area_3,
  ]
})

// area_3
watch([area1, area2], ([area1, area2]) => {
  const value = area3.value

  if (value === area1 || value === area2) {
    area3.value =
      options.find((item) => item !== area1 && item !== area2) ?? area3.value
  }
})
// area_2
watch([area1, area3], ([area1, area3]) => {
  const value = area2.value

  if (value === area1 || value === area3) {
    area2.value =
      options.find((item) => item !== area1 && item !== area3) ?? area2.value
  }
})
// area_1
watch([area2, area3], ([area2, area3]) => {
  const value = area1.value

  if (value === area2 || value === area3) {
    area1.value =
      options.find((item) => item !== area2 && item !== area3) ?? area1.value
  }
})

const countAreaActive = computed(() => {
  // eslint-disable-next-line functional/no-let
  let count = 0
  for (const val of Object.values(areaActive)) if (val) count++
  return count
})
watchEffect(() => {
  areaActive[AreaComponent.Console] =
    settingsStore.areaActive[AreaComponent.Console]
  areaActive[AreaComponent.Editor] =
    settingsStore.areaActive[AreaComponent.Editor]
  areaActive[AreaComponent.Preview] =
    settingsStore.areaActive[AreaComponent.Preview]
})
watch(
  countAreaActive,
  (value) => {
    if (settingsStore.isModeDisabled(mode.value, value)) {
      mode.value = Mode.rows
    }
  },
  { immediate: true }
)
const findNextAreaActive = (
  start: AreaComponent,
  ignore: (AreaComponent | false)[]
) => {
  for (let i = start; i < start + 3; i++) {
    const index = (i >= 3 ? i - 3 : i) as AreaComponent
    const val = areaActive[index]

    if (ignore.includes(index)) continue

    if (val) return index
  }
}
watch(
  areaActive,
  (areaActive) => {
    const a1 = countAreaActive.value > 1
    const a2 = countAreaActive.value > 2
    const a3 = true

    if (countAreaActive.value > 1 && !areaActive[area1.value]) {
      area1.value =
        findNextAreaActive(area1.value, [
          a2 && area2.value,
          a3 && area3.value,
        ]) ?? area1.value
    }
    if (countAreaActive.value > 2 && !areaActive[area2.value]) {
      area2.value =
        findNextAreaActive(area2.value, [
          a1 && area1.value,
          a3 && area3.value,
        ]) ?? area2.value
    }
    if (!areaActive[area3.value]) {
      area3.value =
        findNextAreaActive(area3.value, [
          a1 && area1.value,
          a2 && area2.value,
        ]) ?? area3.value
    }
  },
  { immediate: true, deep: true }
)

// =============== setup ui done ==============
function apply() {
  settingsStore.mode = mode.value
  settingsStore.mapTargetTo = {
    area_1: area1.value,
    area_2: area2.value,
    area_3: area3.value,
  }
  Object.assign(settingsStore.areaActive, areaActive)
}
</script>

<style lang="scss" scoped>
@import "components/sketch/SketchMain/SketchMain.styles.scss";

.icon {
  width: 28px;
  height: 24px;
  border-radius: 5px;
  display: inline-block;
  position: relative;
  border: 1px solid currentColor;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background-color: currentColor;
  }

  &-columns {
    &:before,
    &:after {
      width: 100%;
      height: 1px;
      left: 0;
      top: (100% / 3);
      transform: translateY(-50%);
    }
    &:after {
      top: (100% / 3 * 2);
    }
  }
  &-rows {
    &:before,
    &:after {
      width: 1px;
      height: 100%;
      top: 0;
      left: (100% / 3);
      transform: translateX(-50%);
    }
    &:after {
      left: (100% / 3 * 2);
    }
  }

  &-bottom {
    &:before {
      height: 1px;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 50%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &-right {
    &:before {
      height: 1px;
      width: 50%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 100%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &-top {
    &:before {
      height: 1px;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 50%;
      top: 50%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &-left {
    &:before {
      height: 1px;
      width: 50%;
      top: 50%;
      left: 50%;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 100%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>

<style lang="scss" scoped>
.area_1,
.area_2,
.area_3 {
  @apply flex items-center justify-center border border-blue-400 border-dashed;
}
</style>

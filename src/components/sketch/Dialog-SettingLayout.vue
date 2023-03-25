<template>
  <q-dialog full-height>
    <q-card>
      <q-card-section>
        <q-card-title class="text-subtitle1">Setting Layout</q-card-title>
      </q-card-section>
      <q-card-section>
        <section class="row">
          <div
            v-for="(_, value) in ModeSize"
            :key="value"
            v-memo="[value === mode]"
            class="col-4 py-1 cursor-pointer"
            @click="mode = value"
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
              <span class="ml-[10px] text-white capitalize font-normal">{{
                Mode[value]
              }}</span>
            </div>
          </div>
        </section>
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1">Preview</div>
        <!-- frame preview -->
        <div class="aspect-[4/3] max-w-full w-[340px] text-center">
          <div class="container" :class="Mode[mode]">
            <div class="area_1">
              <q-select
                v-model="area1"
                dense
                :options="options"
                :option-label="optionLabel"
              />
            </div>
            <div class="group">
              <div class="area_2">
                <q-select
                  v-model="area2"
                  dense
                  :options="options"
                  :option-label="optionLabel"
                />
              </div>
              <div class="area_3">
                <q-select
                  v-model="area3"
                  dense
                  :options="options"
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
  AreaComponent,
  AreaComponentSize,
  Mode,
  ModeSize,
} from "./Layout.types"

const settingsStore = useSettingsStore()

const options: AreaComponent[] = Array(AreaComponentSize)
  .fill(0)
  .map((_, index) => index)
const optionLabel = (index: AreaComponent) => AreaComponent[index]

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

// =============== setup ui done ==============
function apply() {
  settingsStore.mode = mode.value
  settingsStore.mapTargetTo = {
    area_1: area1.value,
    area_2: area2.value,
    area_3: area3.value,
  }
}
</script>

<style lang="scss" scoped>
@import "./Layout.styles.scss";

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

<template>
  <div class="flex flex-nowrap items-center select-none py-[3px]">
    <Icon
      v-if="dir"
      icon="material-symbols:chevron-right"
      class="text-[1.2rem]"
    />

    <div class="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,.5)]" />

    <div
      class="flex items-center relative z-10 flex-nowrap"
      :class="{
        'pl-[20px]': !dir
      }"
    >
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: dir,
            isOpen: false,
            filepath: inputName
          })
        "
      />

      <input
        v-model="inputName"
        @blur="onBlur"
        @keydown="onKeydown"
        class="bg-transparent text-[14px] ml-2 truncate w-full border focus-visible:outline-none min-w-0"
        :class="
          errorFileName
            ? errorFileName.type === 'warn'
              ? ' border-yellow-600'
              : ' border-red-600'
            : ' border-cyan-600'
        "
      />

      <div v-if="errorFileName" class="absolute pl-[1.7rem] w-full top-[100%]">
        <span
          class="text-[12px] px-1 py-[5px] border border-top-none block w-full"
          :class="
            errorFileName.type === 'warn'
              ? ' bg-yellow-900 border-yellow-600'
              : ' bg-red-900 border-red-600'
          "
        >
          {{ errorFileName.message }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import getIcon from "src/assets/material-icon-theme/dist/getIcon"

import { checkErrorFileName } from "./checkErrorFileName"

const props = defineProps<{
  dir: boolean
  defaultValue?: string
  siblings?: string[]
}>()
const emit = defineEmits<{
  (name: "save", value: string): void
  (name: "blur"): void
}>()

const inputName = ref(props.defaultValue ?? "")
const skipEmptyFileName = ref(true)

const watcher = watch(inputName, () => {
  if (inputName.value !== "") {

    skipEmptyFileName.value = false
    watcher()
  }
})

const errorFileName = computed(() =>
  checkErrorFileName(
    inputName.value,
    props.siblings || [],
    skipEmptyFileName.value
  )
)

function onBlur() {
  if (
    !errorFileName.value &&
    inputName.value !== "" &&
    inputName.value !== props.defaultValue
  ) {
    emit("save", inputName.value)
  }

  emit("blur")
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    if (!errorFileName.value && inputName.value !== "") {
      ;(event.target as HTMLInputElement).blur()
    }
  }
}
</script>

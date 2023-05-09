<template>
  <div class="inline-block relative">
    <input
      v-model="input"
      class="bg-transparent truncate w-full border focus-visible:outline-none min-w-0"
      :class="
        error
          ? error.type === 'warn'
            ? 'border-yellow-600'
            : 'border-red-600'
          : 'border-cyan-600'
      "
      ref="inputRef"
      @blur="onBlur"
      @keypress.enter="onEnter"
    />

    <div v-if="error" class="absolute w-full left-0">
      <span
        class="text-12px px-1 py-5px border border-top-none block w-full"
        :class="
          error.type === 'warn'
            ? 'bg-yellow-900 border-yellow-600'
            : 'bg-red-900 border-red-600'
        "
        v-html="error.message"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { basename } from "path"

import type { Entry } from "src/types/Entry"

import { checkErrorFileName } from "./checkErrorFileName"

const props = defineProps<{
  currentName: string
  sibDirectories: Record<string, Entry<"directory">>
  sibFiles: Record<string, Entry<"file">>
  newer?: boolean
}>()
const emit = defineEmits<{
  (name: "save", value: string): void
  (name: "cancel"): void
  (name: "input", value: string): void
}>()

const input = ref(props.currentName)
const error = computed(() =>
  checkErrorFileName(
    input.value,
    props.sibDirectories,
    props.sibFiles,
    props.newer
  )
)

watch(input, (val) => emit("input", val))

const inputRef = ref<HTMLInputElement>()
watch(inputRef, (input) => {
  if (!input) return

  setTimeout(() => {
    input.select()
    input.setSelectionRange(0, basename(input.value).length)
  }, 70)
})

function onBlur() {
  if (error.value || props.currentName === input.value) emit("cancel")
}
function onEnter() {
  if (error.value || props.currentName === input.value) return

  emit("save", input.value)
}
</script>

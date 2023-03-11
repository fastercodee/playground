<template>
  <div class="flex items-center bg-dark-100 min-w-0">
    <input
      v-bind="attrs"
      v-model="value"
      class="block min-w-0 h-[30px] flex-1 bg-transparent text-[14px] py-[4px] pl-1 focus-visible:outline-none border border-gray-700 focus:border-blue-300"
    />

    <Icon
      v-for="action in actions"
      :key="action.icon"
      :icon="action.icon"
      class="cursor-pointer px-[1px] mx-[1px] w-[20px] h-full"
      :class="{
        'text-blue-400': action.model.value
      }"
      @click="action.model.value = !action.model.value"
    />
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"

const attrs = useAttrs()

const props = defineProps<{
  actions: {
    icon: string
    model: Ref<boolean>
  }[]

  modelValue: string
}>()
const emit = defineEmits<{
  (name: "update:model-value", value: string): void
}>()

const value = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => (value.value = val)
)
watch(value, (val) => emit("update:model-value", val))
</script>

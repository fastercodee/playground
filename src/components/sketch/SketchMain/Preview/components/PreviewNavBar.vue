<template>
  <div class="flex flex-nowrap items-center py-0.5 px-2">
    <q-btn
      round
      dense
      class="!px-1 !py-1 min-w-0 min-h-0"
      @click="emit('click:back')"
    >
      <Icon icon="fluent:arrow-left-20-regular" class="icon" />
    </q-btn>
    <q-btn
      round
      dense
      class="!px-1 !py-1 min-w-0 min-h-0"
      @click="emit('click:forward')"
    >
      <Icon icon="fluent:arrow-right-20-regular" class="icon" />
    </q-btn>

    <q-btn
      round
      dense
      class="!px-1 !py-1 min-w-0 min-h-0"
      @click="emit('click:reload')"
    >
      <Icon
        :icon="loading ? 'codicon:close' : 'codicon:refresh'"
        class="icon"
      />
    </q-btn>

    <q-btn
      round
      dense
      class="!px-1 !py-1 min-w-0 min-h-0"
      @click="emit('click:hard-reload')"
    >
      <Icon icon="mdi:reload-alert" class="icon" />
    </q-btn>

    <input
      :value="src"
      @input="emit('update:src', ($event.target as HTMLInputElement).value)"
      type="url"
      placeholder="URL"
    />

    <q-btn round dense class="!px-1 !py-1 min-w-0 min-h-0" @click="exteralLink">
      <Icon icon="codicon:link-external" class="icon" />
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"

const props = defineProps<{
  src: string
  loading: boolean
}>()

const emit = defineEmits<{
  (name: "update:src", value: string): void
  (
    name: "click:back" | "click:forward" | "click:reload" | "click:hard-reload"
  ): void
}>()

function exteralLink() {
  window.open(props.src)
}
</script>

<style lang="scss" scoped>
input {
  @apply flex-1 w-full border-none mr-0.3em px-1  py-0.5 min-h-0 text-13px;

  color: #c3c3c3;
  outline-color: #261616;
  background-color: rgba(17, 17, 20, 0.67);

  &:focus {
    border-color: #261616;
  }

  &:focus-visible,
  &:focus {
    outline: none;
  }
}

.icon {
  @apply text-16px;
}

.icon:hover {
  color: #fff;
}
</style>

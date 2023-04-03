import { defineStore } from "pinia"

export const usePreviewStore = defineStore("preview", () => {
  const _channel = ref<MessageChannel | null>(null)
  watch(_channel, (_, oldChannel) => {
    if (oldChannel !== null) {
      oldChannel.port1.close()
      oldChannel.port2.close()
    }
  })

  const channel = computed(() => _channel.value)

  function setChannel<T extends MessageChannel | null>(channel: T): T {
    _channel.value = channel
    return channel
  }

  return { channel, setChannel }
})

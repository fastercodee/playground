<template>
  <q-btn
    class="w-full bg-[#2B3245]"
    no-caps
    @click="loginWithGoogle"
    :disable="verifingOauth2"
  >
    <Icon icon="logos:google-icon" class="mr-1" />
    Continue with Google

    <q-spinner-tail
      v-if="route.query.type === 'google' && verifingOauth2"
      class="ml-1"
      size="20px"
      color="white"
    />
  </q-btn>
  <q-btn
    class="w-full bg-[#2B3245] mt-3"
    no-caps
    @click="loginWithGithub"
    :disable="verifingOauth2"
  >
    <Icon icon="logos:github-icon" class="mr-1" />
    Continue with Github

    <q-spinner-tail
      v-if="route.query.type === 'github' && verifingOauth2"
      class="ml-1"
      size="20px"
      color="white"
    />
  </q-btn>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { loginWithGithub, loginWithGoogle } from "boot/auth"

const route = useRoute()

defineProps<{
  verifingOauth2: boolean
}>()
</script>

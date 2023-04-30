<template>
  <q-page class="flex flex-nowrap w-full w-[100vw] min-h-[100vh]">
    <q-header class="bg-[#1C2333]">
      <q-toolbar>
        <q-avatar>
          <img src="~/assets/favicon.svg" />
        </q-avatar>

        <q-toolbar-title class="text-16px font-medium"
          >Sketch Code</q-toolbar-title
        >
      </q-toolbar>
    </q-header>

    <main class="w-full h-full">
      <q-card flat class="w-full max-w-280px mx-auto mx-5 py-20">
        <q-card-section>
          <h1 class="text-subtitle1 text-24px">Log in to your account</h1>
        </q-card-section>

        <q-card-section>
          <q-input
            standout
            color="green-5"
            label="Email or username"
            v-model="email"
            class="mb-3 control-transparent"
          />
          <q-input
            standout
            color="green-5"
            label="Password"
            :type="isPwd ? 'password' : 'text'"
            v-model="password"
            class="control-transparent"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                color="white"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <div class="text-right mt-1 text-gray-400">
            <small>Forgot password?</small>
          </div>

          <q-btn
            rounded
            color="green-7"
            class="w-full mt-5"
            no-caps
            @click="logIn"
          >
            <span class="relative">
              Log In
              <span class="ml-1.5 absolute left-100%">
                <Icon
                  v-if="!loading"
                  icon="fluent:arrow-right-24-regular"
                  width="20"
                  height="20"
                />
                <q-spinner-tail v-else size="20px" color="white" />
              </span>
            </span>
          </q-btn>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-btn class="w-full bg-[#2B3245]" no-caps>
            <Icon icon="logos:google-icon" class="mr-1" />
            Continue with Google
          </q-btn>
        </q-card-section>

        <q-card-section class="text-center">
          <small class="text-13px"
            >New user? <span class="text-[#57ABFF]">Sign Up</span></small
          >
        </q-card-section>
      </q-card>
    </main>
  </q-page>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { AxiosError, AxiosResponse } from "axios"

const auth = useAuth()
const $q = useQuasar()

const email = ref("")
const password = ref("")

const isPwd = ref(true)

const loading = ref(false)

async function logIn() {
  loading.value = true

  try {
    const user = await auth.login({
      data: {
        username: email.value,
        password: password.value,
      },
    })

    console.log(user)
  } catch (err) {
    $q.notify({
      position: "bottom-right",
      type: "negative",
      group: false,
      message:
        (err as AxiosError<any> | undefined)?.response?.data?.message ??
        (err as Error | undefined)?.message,
    })
  }

  loading.value = false
}
</script>

<style lang="scss" scoped>
.control-transparent :deep(.q-field__control) {
  background-color: rgba(255, 255, 255, 0.07) !important;
  input {
    color: white !important;
  }
  height: 50px !important;

  .q-field__label {
    top: 16px !important;
    font-size: 14px !important;
  }
}
</style>

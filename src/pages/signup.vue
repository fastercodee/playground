<route lang="yaml">
meta:
  auth:
    roles: false
    notFoundRedirect: /
    forbiddenRedirect: /
</route>

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

    <main class="fit">
      <q-form @submit="signUp">
        <q-card flat class="w-full max-w-280px mx-auto mx-5 py-20 transparent">
          <q-card-section>
            <h1 class="text-subtitle1 text-24px">Sign up to your account</h1>
          </q-card-section>

          <q-card-section>
            <q-input
              v-if="!verifyOAuth2"
              standout
              color="green-5"
              label="Email"
              type="email"
              v-model="email"
              class="mb-3 q-input--custom q-input--medium"
              debounce="500"
              :rules="rules.email"
              name="email"
            />
            <q-input
              v-if="!verifyOAuth2"
              standout
              color="green-5"
              label="Password"
              :type="isPwd ? 'password' : 'text'"
              v-model="password"
              class="mb-3 q-input--custom q-input--medium"
              lazy-rule
              :rules="rules.password"
              name="password"
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
            <q-input
              standout
              color="green-5"
              label="Username"
              v-model="username"
              class="mb-3 q-input--custom q-input--medium"
              debounce="500"
              :rules="rules.username"
              name="username"
            />

            <q-btn
              rounded
              color="green-7"
              class="w-full mt-5"
              no-caps
              type="submit"
            >
              <span class="relative">
                Sign Up
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
            <LoginWith :verifing-oauth2="verifyOAuth2 && loading" />
          </q-card-section>

          <q-card-section class="text-center">
            <small class="text-13px"
              >Have account?
              <router-link to="/login" class="text-[#57ABFF]"
                >Sign In</router-link
              ></small
            >
          </q-card-section>
        </q-card>
      </q-form>
    </main>
  </q-page>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { AxiosError } from "axios"
import { QForm } from "quasar"
import { api } from "src/boot/axios"
import { useVerifyOAuth2 } from "src/composables/use-verify-oauth2"
import { User } from "src/types/api/Models/User"

const auth = useAuth()
const notify = useNotify()

const { verifyOAuth2, loginWithOauth2 } = useVerifyOAuth2()

const email = ref("")
const password = ref("")
const username = ref("")

const rules = {
  email: [
    (v: string) =>
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        v
      )
        ? true
        : "Email invalid",
    (v: string) => {
      if (!v.trim().length) return true

      return (
        api
          .post("/auth/check_email", {
            email: v,
          })
          .then(() => true)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((err: AxiosError<any>) => {
            return (
              err?.response?.data?.errors?.email?.[0] ??
              err?.response?.data?.message
            )
          })
      )
    },
  ],
  password: [
    (v: string) =>
      /^(?=.*[A-Z])(?=.*\d).*$/.test(v)
        ? true
        : "Your password must contain at least one uppercase character and one number",
  ],
  username: [
    (v: string) =>
      /^[a-z\d](?:[a-z\d_]|-(?=[a-z\d_])){0,38}$/i.test(v)
        ? true
        : "Username invalid",
    (v: string) => {
      if (!v.trim().length) return true

      return (
        api
          .post("/auth/check_username", {
            username: v,
          })
          .then(() => true)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((err: AxiosError<any>) => {
            return err?.response?.data?.message
          })
      )
    },
  ],
}

const isPwd = ref(true)

const loading = ref(false)
async function signUp() {
  loading.value = true

  try {
    const user = verifyOAuth2.value
      ? await loginWithOauth2(username.value)
      : await auth
          .register({
            data: {
              email: email.value,
              username: username.value,
              password: password.value,
            },
          })
          .then((res) => res.data.user as User)

    if (user) notify.success(`You register in as ${user.name ?? user.username}`)
  } catch (err) {
    notify.error(err)
  }

  loading.value = false
}
</script>

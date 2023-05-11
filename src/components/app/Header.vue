<template>
  <q-header class="bg-[#1C2333]">
    <q-toolbar>
      <q-avatar>
        <img src="~/assets/favicon.svg" />
      </q-avatar>

      <q-toolbar-title class="text-16px font-medium"
        >Sketch Code</q-toolbar-title
      >

      <q-space />

      <q-btn dense no-caps rounded unelevated to="/new">
        <Icon icon="codicon:add" width="1.2em" height="1.2em" class="mr-1" />
        New sketch
      </q-btn>

      <button
        v-if="auth.check() && user"
        class="w-48px h-48px hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-2px before:top-0 before:left-0"
      >
        <q-avatar size="27px">
          <img
            :src="
              user.picture ?? `https://ui-avatars.com/api/?name=${user.name}`
            "
          />
          {{ user }}
        </q-avatar>

        <q-menu anchor="bottom right" self="top right">
          <q-list class="min-w-130px">
            <q-item clickable class="min-h-0" to="/profile">
              <q-item-section>Profile</q-item-section>
            </q-item>
            <q-item clickable class="min-h-0" to="/account">
              <q-item-section>Account</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable class="min-h-0" @click="auth.logout()">
              <q-item-section>Log out</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
      <button
        v-else
        class="w-48px h-48px hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-2px before:top-0 before:left-0"
      >
        <Icon icon="codicon:account" class="w-24px h-24px" />

        <q-menu anchor="bottom right" self="top right">
          <q-list class="min-w-130px">
            <q-item clickable to="/login">
              <q-item-section>Log in</q-item-section>
            </q-item>
            <q-item clickable to="/signup">
              <q-item-section>Sign up</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </button>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { User } from "src/types/api/Models/User"

const auth = useAuth()
const user = useUser<User>()
</script>

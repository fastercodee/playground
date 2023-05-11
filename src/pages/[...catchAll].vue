<route lang="yaml">
name: "catch-all"
</route>

<template>
  <q-page
    class="text-white text-center h-full w-full flex items-center justify-center"
  >
    <Header />
    <div class="q-pa-md">
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts"></script>

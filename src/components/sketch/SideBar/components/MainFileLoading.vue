<template>
  <main class="min-h-0 h-full select-none">
    <template>
      <q-skeleton
        type="rect"
        v-for="_ in 10"
        :key="_"
        class="my-4 mx-4 h-15px"
      />
    </template>
  </main>
</template>

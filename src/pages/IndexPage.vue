<template>
  <q-page class="flex column w-full">
    <!-- <ToolBar /> -->

    <div class="flex h-full flex-1 w-full">
      <SideBar />
      <SettingLayout />
      <div class="flex flex-1 min-w-0">
        <Editor />
        <Preview />
        <!-- editor -->
      </div>
      <Console />
    </div>
  </q-page>
</template>

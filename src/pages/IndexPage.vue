<template>
  <q-page class="flex column w-full">
    <!-- <ToolBar /> -->

    <div class="flex h-full flex-1 w-full">
      <SideBar />
      <div class="flex flex-1 min-w-0">
        <div class="flex flex-col flex-nowrap w-full">
          <SeasonManager />
          <Editor />
        </div>
        <Preview />
        <!-- editor -->
      </div>
    </div>
  </q-page>
</template>

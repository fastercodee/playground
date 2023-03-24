<template>
  <section class="select-mode">
    <q-btn>
      <span class="icon icon-columns" />
    </q-btn>
    <q-btn>
      <span class="icon icon-rows" />
    </q-btn>
    <q-btn>
      <span class="icon icon-bottom" />
    </q-btn>
    <q-btn>
      <span class="icon icon-right" />
    </q-btn>
    <q-btn>
      <span class="icon icon-top" />
    </q-btn>
    <q-btn>
      <span class="icon icon-left" />
    </q-btn>
  </section>
</template>

<style lang="scss" scoped>
.icon {
  width: 28px;
  height: 24px;
  border-radius: 5px;
  display: inline-block;
  position: relative;
  color: rgba(200, 200, 200, 0.5);
  border: 1px solid currentColor;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background-color: currentColor;
  }

  &-columns {
    &:before {
      height: 1px;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 100%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  &-rows {
    &:before,
    &:after {
      width: 1px;
      height: 100%;
      top: 0;
      left: (100% / 3);
      transform: translateX(-50%);
    }
    &:after {
      left: (100% / 3 * 2);
    }
  }

  &-bottom {
    &:before {
      height: 1px;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 50%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &-right {
    &:before {
      height: 1px;
      width: 50%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 100%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &-top {
    &:before {
      height: 1px;
      width: 100%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 50%;
      top: 50%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &-left {
    &:before {
      height: 1px;
      width: 50%;
      top: 50%;
      left: 50%;
      transform: translateY(-50%);
    }
    &:after {
      width: 1px;
      height: 100%;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>

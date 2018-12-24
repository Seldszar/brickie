<template functional>
  <div :class="$style.wrapper">
    <div v-if="props.type === 'emoji'" v-text="props.value" />
    <img v-else :src="props.value" />
  </div>
</template>

<style lang="scss" module>
.wrapper {
  align-items: center;
  display: flex;
  font-size: 64px;
  justify-content: center;
  line-height: 1;
  text-shadow: none;

  img {
    display: block;
    height: 64px;
  }
}
</style>

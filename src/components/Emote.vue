<template>
  <div :class="$style.wrapper">
    <template v-if="type === 'emoji'">
      {{ value }}
    </template>
    <template v-else>
      <img :src="value">
    </template>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" module>
.wrapper {
  align-items: center;
  display: flex;
  font-size: rem-calc(64);
  justify-content: center;
  line-height: 1;
  text-shadow: none;

  img {
    display: block;
    height: rem-calc(64);
  }
}
</style>

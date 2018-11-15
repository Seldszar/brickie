<template>
  <div :class="$style.wrapper">
    <transition mode="out-in" :class="false" v-on="{ beforeEnter, enter, afterEnter, beforeLeave, leave }">
      <div :key="index" v-if="state === 'playing'">
        {{ items[index] }}
      </div>
    </transition>
  </div>
</template>

<script>
import { TweenLite } from "gsap";

export default {
  data() {
    return {
      items: ["Brickie by Seldszar", "Find it here: https://github.com/seldszar/brickie"],
      state: "loading",
      index: 0,
    };
  },
  watch: {
    state(newValue) {
      if (newValue === "waiting") {
        setTimeout(() => this.setState("playing"), 300000);
      }
    },
  },
  mounted() {
    this.setState("waiting");
  },
  methods: {
    setState(state) {
      this.state = state;
    },
    gotoNextItem() {
      if (++this.index >= this.items.length) {
        this.setState("waiting");
        this.index = 0;
      }
    },
    beforeEnter(el) {
      TweenLite.set(el, { opacity: 0 });
    },
    beforeLeave(el) {
      TweenLite.set(el, { opacity: 1 });
    },
    afterEnter() {
      setTimeout(() => this.gotoNextItem(), 8000);
    },
    enter(el, onComplete) {
      TweenLite.to(el, 1, { opacity: 1, onComplete });
    },
    leave(el, onComplete) {
      TweenLite.to(el, 1, { opacity: 0, onComplete });
    },
  },
};
</script>

<style lang="scss" module>
.wrapper {
  font-size: rem-calc(24);
  font-weight: 700;
  text-align: center;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}
</style>

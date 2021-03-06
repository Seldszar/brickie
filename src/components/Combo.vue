<template>
  <transition :css="false" appear v-on="{ beforeEnter, beforeLeave, enter, leave }">
    <div :class="$style.wrapper" :style="wrapperStyle">
      <div :class="$style.inner">
        <div :class="$style.emote">
          <div ref="emote"><Emote v-bind="emote" /></div>
        </div>
        <div v-show="amount > 1" :class="[$style.amount, { [$style.animated]: amount >= 10 }]">
          <div ref="amount"><small>x</small>{{ amount }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { TimelineLite, TweenLite } from "gsap";
import { random, sample } from "lodash";
import Emote from "./Emote.vue";

export default {
  components: {
    Emote,
  },
  props: {
    emote: {
      type: Object,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      rotation: random(-20, 20),
      x: random(0, 100),
      y: random(0, 100),
    };
  },
  computed: {
    emoteRotation() {
      return this.rotation;
    },
    amountRotation() {
      return -this.rotation;
    },
    scale() {
      return 1 + Math.min(1, (this.amount - 1) / 24);
    },
    wrapperStyle() {
      return {
        left: `${this.x}%`,
        top: `${this.y}%`,
        zIndex: this.amount * 2,

        "--emote-rotation": `${this.emoteRotation}deg`,
        "--amount-rotation": `${this.amountRotation}deg`,
        "--glow-opacity": Math.min(Math.max((this.amount - 5) / 20, 0), 1),
        "--glow-duration": `${0.1 + Math.max(0, 25 - this.amount) * 0.5}s`,
        "--flash-duration": `${0.2 + Math.max(0, 25 - this.amount) * 0.5}s`,
      };
    },
  },
  watch: {
    amount() {
      TweenLite.killTweensOf(this.$el);

      TweenLite.fromTo(
        this.$el,
        0.3,
        { scale: this.scale * 1.2 },
        { opacity: 1, scale: this.scale },
      );

      TweenLite.fromTo(
        this.$refs.emote,
        0.3,
        { rotation: this.emoteRotation + sample([-10, 10]) },
        { rotation: this.emoteRotation },
      );

      TweenLite.fromTo(
        this.$refs.amount,
        0.3,
        { rotation: this.emoteRotation + sample([-10, 10]) },
        { rotation: this.amountRotation },
      );
    },
  },
  methods: {
    beforeEnter(el) {
      TweenLite.set(el, { opacity: 0 });
    },
    enter(el, onComplete) {
      TweenLite.to(el, 0.3, { opacity: 1, onComplete });
    },
    beforeLeave(el) {
      TweenLite.killTweensOf(el);
      TweenLite.set(el, { zIndex: "-=1" });
    },
    leave(el, onComplete) {
      const tl = new TimelineLite({ onComplete });
      const delay = Math.min(20, 0.5 + this.amount / 2);

      tl.to(el, 0.3, { opacity: 0.5, scale: this.scale });
      tl.to(el, 0.6, { opacity: 0, delay });
    },
  },
};
</script>

<style lang="scss" module>
@keyframes glow {
  from {
    filter: hue-rotate(0deg);
    transform: rotate(0deg);
  }

  to {
    filter: hue-rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes flash {
  from {
    filter: hue-rotate(180deg);
  }

  to {
    filter: hue-rotate(540deg);
  }
}

.wrapper {
  align-items: center;
  display: flex;
  height: 256px;
  justify-content: center;
  position: absolute;
  transform: translate(-50%, -50%);
  width: 256px;
  z-index: 10;

  &:before {
    animation: glow var(--glow-duration) linear infinite;
    background: url("../assets/glow.png") no-repeat center;
    background-size: contain;
    bottom: 0;
    content: "";
    opacity: var(--glow-opacity);
    display: block;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
}

.inner {
  align-items: center;
  display: flex;
  font-size: 38px;
  position: relative;
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

.emote {
  transform: rotate(var(--emote-rotation));
}

.amount {
  left: 50%;
  font-size: 52px;
  position: absolute;
  transform: translateX(-50%) rotate(var(--amount-rotation)) translateY(25%);
  top: 50%;
  white-space: nowrap;

  &.animated {
    animation: flash var(--flash-duration) linear infinite;
    color: #ff9999;
  }
}
</style>

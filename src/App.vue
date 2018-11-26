<template>
  <div :class="$style.wrapper">
    <div :class="$style.credits" v-if="$settings.showCredits">
      <Credits />
    </div>
    <div :class="$style.inner" :style="{ fontFamily: $settings.font.family, fontWeight: $settings.font.weight }">
      <Combo
        :key="combo.id"
        :emote="combo.emote"
        :amount="combo.amount"
        v-if="combo.amount >= $settings.threshold"
        v-for="combo in combos"
      />
    </div>
  </div>
</template>

<script>
import emojiRegex from "emoji-regex";
import Queue from "p-queue";
import ky from "ky";
import { find, findIndex, keys, some } from "lodash";
import { Client } from "twitch-js";

import Combo from "./components/Combo.vue";
import Credits from "./components/Credits.vue";

export default {
  components: {
    Combo,
    Credits,
  },
  data() {
    return {
      combos: [],
    };
  },
  async created() {
    const allEmotes = await this.fetchAllEmotes();
    let id = 0;

    const client = new Client({
      channels: [`#${this.$settings.channel}`],
      connection: {
        reconnect: true,
      },
    });

    const queue = new Queue({
      concurrency: 1,
    });

    const processMessage = (context, message) => {
      const messageEmotes = this.getMessageEmotes(allEmotes, context, message);

      for (const [index, combo] of this.combos.entries()) {
        if (some(messageEmotes, combo.emote)) {
          combo.amount += 1;
        } else {
          this.combos.splice(index, 1);
        }
      }

      for (const emote of messageEmotes) {
        if (findIndex(this.combos, { emote }) === -1) {
          id = (id + 1) % Number.MAX_SAFE_INTEGER;
          this.combos.push({ id, emote, amount: 1 });
        }
      }
    };

    const isExcludedUser = context => {
      return this.$settings.excludedUsers.some(
        username => username.localeCompare(context.username) === 0,
      );
    };

    client.on("chat", (channel, context, message) => {
      if (isExcludedUser(context)) {
        return;
      }

      queue.add(processMessage.bind(null, context, message));
    });

    await client.connect();
  },
  methods: {
    async fetchAllEmotes() {
      const allEmotes = [];

      try {
        await ky
          .get(`https://api.betterttv.net/2/emotes`)
          .then(res => res.json())
          .then(data => {
            for (const emote of data.emotes) {
              allEmotes.push({
                name: emote.code,
                url: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
              });
            }
          });
      } catch (error) {
        // ...
      }

      try {
        await ky
          .get(`https://api.betterttv.net/2/channels/${this.$settings.channel}`)
          .then(res => res.json())
          .then(data => {
            for (const emote of data.emotes) {
              allEmotes.push({
                name: emote.code,
                url: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
              });
            }
          });
      } catch (error) {
        // ...
      }

      try {
        await ky
          .get(`https://api.frankerfacez.com/v1/set/global`)
          .then(res => res.json())
          .then(data => {
            for (const set of Object.values(data.sets)) {
              for (const emote of set.emoticons) {
                allEmotes.push({
                  name: emote.name,
                  url: `https://${emote.urls["4"] || emote.urls["2"] || emote.urls["1"]}`,
                });
              }
            }
          });
      } catch (error) {
        // ...
      }

      try {
        await ky
          .get(`https://api.frankerfacez.com/v1/room/${this.$settings.channel}`)
          .then(res => res.json())
          .then(data => {
            for (const set of Object.values(data.sets)) {
              for (const emote of set.emoticons) {
                allEmotes.push({
                  name: emote.name,
                  url: `https://${emote.urls["4"] || emote.urls["2"] || emote.urls["1"]}`,
                });
              }
            }
          });
      } catch (error) {
        // ...
      }

      return allEmotes;
    },
    getMessageEmotes(allEmotes, context, message) {
      const regex = emojiRegex();
      const messageEmotes = [];
      let match;

      for (const value of keys(context.emotes)) {
        messageEmotes.push({
          type: "emote",
          value: `https://static-cdn.jtvnw.net/emoticons/v1/${value}/4.0`,
        });
      }

      for (const word of message.split(/\s+/)) {
        const emote = find(allEmotes, ["name", word]);

        if (emote) {
          messageEmotes.push({
            type: "emote",
            value: emote.url,
          });
        }
      }

      while ((match = regex.exec(message))) {
        messageEmotes.push({
          type: "emoji",
          value: match[0],
        });
      }

      return messageEmotes;
    },
  },
};
</script>

<style lang="scss" module>
@include foundation-global-styles;
@include foundation-typography;

.wrapper {
  height: 100vh;
  overflow: hidden;
  padding: rem-calc(128);
  position: relative;
}

.inner {
  height: 100%;
  position: relative;
}

.credits {
  left: 10px;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 100;
}
</style>

<template>
  <div :class="$style.wrapper">
    <div :class="$style.credits" v-if="$settings.showCredits"><Credits /></div>
    <div :class="$style.inner">
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
import hyperid from "hyperid";
import Queue from "p-queue";
import ky from "ky";
import { some } from "lodash";
import Sockette from "sockette";
import tekko from "tekko";

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

    const instance = hyperid();
    const queue = new Queue({ concurrency: 1 });

    const processMessage = message => {
      const messageEmotes = this.getMessageEmotes(allEmotes, message);

      for (let i = this.combos.length - 1; i >= 0; i -= 1) {
        const combo = this.combos[i];

        if (some(messageEmotes, combo.emote)) {
          combo.amount += 1;
        } else {
          this.combos.splice(i, 1);
        }
      }

      messageEmotes.forEach(emote => {
        if (some(this.combos, { emote })) {
          return;
        }

        this.combos.push({ emote, id: instance(), amount: 1 });
      });
    };

    const isExcludedUser = query => {
      return this.$settings.excludedUsers.some(username => {
        const result = username.localeCompare(query, undefined, {
          sensitivity: "base",
          usage: "search",
        });

        return result === 0;
      });
    };

    new Sockette("wss://irc-ws.chat.twitch.tv:443", {
      onopen: event => {
        event.target.send(`CAP REQ :twitch.tv/tags`);
        event.target.send(`NICK justinfan${80000 + Math.round(Math.random() * 1000)}`);
        event.target.send(`JOIN #${this.$settings.channel}`);
      },
      onmessage: event => {
        for (const chunk of event.data.split("\r\n")) {
          if (chunk.length > 0) {
            const parsed = tekko.parse(chunk);

            if (parsed.command === "PRIVMSG") {
              if (isExcludedUser(parsed.prefix.user)) {
                return;
              }

              queue.add(processMessage.bind(null, parsed));
            }
          }
        }
      },
    });
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
    getMessageEmotes(allEmotes, message) {
      const regex = emojiRegex();
      const messageEmotes = [];
      let match;

      if (message.tags.emotes) {
        for (const pair of message.tags.emotes.split("/")) {
          const id = parseInt(pair.substr(0, pair.indexOf(":")), 10);

          messageEmotes.push({
            type: "emote",
            value: `https://static-cdn.jtvnw.net/emoticons/v1/${id}/4.0`,
          });
        }
      }

      for (const word of message.trailing.split(/\s+/)) {
        const emote = allEmotes.find(o => o.name === word);

        if (emote) {
          messageEmotes.push({
            type: "emote",
            value: emote.url,
          });
        }
      }

      while ((match = regex.exec(message.trailing))) {
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

<style src="sanitize.css" />
<style lang="scss" module>
@font-face {
  font-family: "Chewy";
  src: url("./assets/fonts/chewy.woff") format("woff");
}

*,
::after,
::before {
  box-sizing: border-box;
}

body {
  color: #fff;
  font-family: Chewy;
  font-size: 32px;
  letter-spacing: 2px;
  line-height: 1;
  margin: 0;
  user-select: none;
}

.wrapper {
  height: 100vh;
  overflow: hidden;
  padding: 64px;
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

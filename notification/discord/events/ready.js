import { Events } from "discord.js";

export default {
  name: Events.ClientReady, // name property states which event this file is for
  // once property holds a boolean value that specifies if the event should run only once
  // - the default behavior will be to run on every event instance
  once: true,
  execute: function (client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};

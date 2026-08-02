import { SlashCommandBuilder } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  execute: async function (interaction) {
    await interaction.reply("Pong!");
  },
};

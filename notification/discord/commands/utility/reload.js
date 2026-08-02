import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to reload.")
        .setRequired(true),
    ),
  execute: async function (interaction) {
    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();
    const command = interaction.client.commands.get(commandName);
    if (!command) {
      return interaction.reply(
        `There is no command with name \`${commandName}\`!`,
      );
    }

    try {
      // used for cache-busting through the query-string
      const newCommandFile = await import(
        `./${command.data.name}.js?update=${Date.now()}`
      );

      const newCommand = newCommandFile.default;

      interaction.client.commands.set(newCommand.data.name, newCommand);
      await interaction.reply(
        `Command \`${newCommand.data.name}\` was reloaded!`,
      );
    } catch (error) {
      console.error(error);
      await interaction.reply(
        `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``,
      );
    }
  },
};

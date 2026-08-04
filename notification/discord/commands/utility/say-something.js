import { SlashCommandBuilder } from "discord.js";

export default {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("say-something")
    .setDescription("Calls someone else something")
    .addStringOption((option) =>
      option
        .setName("other-user")
        .setDescription("The user to call something.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("other-caleb")
        .setDescription("The user to call caleb.")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("number-of-times")
        .setDescription("number of times to call the user something")
        .setRequired(false),
    ),
  execute: async function (interaction) {
    const otherUser = interaction.options
      .getString("other-user", true)
      .toLowerCase();

    const numberOfTimes = interaction.options.getString(
      "number-of-times",
      true,
    );

    let somethingStr = `This ${otherUser} is something!\n`;
    let fullsomethingStr = "";
    for (let x = 0; x < numberOfTimes; x++) {
      fullsomethingStr = somethingStr.concat(somethingStr);
    }
    await interaction.reply(fullsomethingStr);
  },
};

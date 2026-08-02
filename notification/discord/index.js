import fs from "node:fs";
import { REST, Routes } from "discord.js";
import { fileURLToPath, pathToFileURL } from "url";
import path, { dirname } from "path";
// The fs module is Node's native file system module. fs is used to read the commands directory and identify our command files.
// - The path module is Node's native path utility module. path helps construct paths to access files and directories. One of the advantages of the path module is that it automatically detects the operating system and uses the appropriate joiners.
// - The Collection class extends JavaScript's native Map class, and includes more extensive, useful functionality. Collection is used to store and efficiently retrieve commands for execution.
import { Client, Collection, GatewayIntentBits } from "discord.js";
import token from "./config.json" with { type: "json" };
import { log } from "node:console";

// Create a new client instance
// Guilds => discord server
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(pathToFileURL(filePath).href);
    const command = commandModule.default;

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if (command?.data && command?.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);

  const eventModule = await import(pathToFileURL(filePath).href);
  const event = eventModule.default;

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token.token);

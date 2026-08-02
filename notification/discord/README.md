In discordjs, they use Common JS, and write

```
const filePath = path.join(commandsPath, file);
const command = require(filePath);
```

However in Javascript that uses type "Module", it cannot be directly converted to

```
const filePath = path.join(commandsPath, file);
import command from filePath with { type: "module" };
```

1. Static import cannot use a variable path — the specifier must be a string literal (or at least statically resolvable), not filePath.
2. with { type: "module" } is not for JS modules — import attributes like with { type: "json" } are for things like JSON; they don’t turn a dynamic path into a valid module import.
3. Node parses import command from ... as invalid, which is why you get Unexpected identifier 'command'.

### Fix

For runtime paths, use **dynamic import**. For runtime paths, use the function form and await it.

```
const filePath = path.join(commandsPath, file);
const commandModule = await import(pathToFileURL(filePath).href);
const command = commandModule.default;
```

## Build Checklist

A step-by-step process for building this Discord bot that notifies on GitHub Actions events.

### 1. Project foundation

- [ ] Initialize the project (`npm init`) and install `discord.js`
- [ ] Set `"type": "module"` in `package.json` (this repo uses ES modules)
- [ ] Create a Discord application + bot in the [Developer Portal](https://discord.com/developers/applications)
- [ ] Store secrets (bot token, client ID, guild ID) in `config.json` and add it to `.gitignore`
- [ ] Declare the required Gateway Intents (start with `GatewayIntentBits.Guilds`)

### 2. Client setup & login

- [ ] Instantiate the `Client` and `client.login(token)`
- [ ] Initialize `client.commands = new Collection()`
- [ ] Initialize `client.cooldowns = new Collection()`

### 3. Command handling

- [ ] Build the command loader that reads the `commands/` folders
- [ ] Skip/warn on any command missing a `data` or `execute` property
- [ ] Build the event loader that reads the `events/` folder (`once` vs `on`)

### 4. Slash commands from Discord

- [ ] Define each command with `SlashCommandBuilder` (name, description, options)
- [ ] Write a deploy script that registers commands via the REST API (`Routes.applicationGuildCommands` for testing, `applicationCommands` for global)
- [ ] Handle the `InteractionCreate` event to route `isChatInputCommand()` to the right command
- [ ] Add `try/catch` around `command.execute()` with an ephemeral error reply

### 5. Cooldowns (rate limiting)

- [ ] Add a `cooldown` property to commands that need it
- [ ] Add the cooldown check in `interactionCreate.js` (path: `cooldowns > command > user > timestamp`)
- [ ] Clean up expired timestamps with `setTimeout`

### 6. Reloading commands

- [ ] Add a `reload` command so commands can be re-imported without restarting the bot
- [ ] Use dynamic `import()` with a cache-busting query (e.g. `?update=${Date.now()}`) since ES modules are cached

### 7. Interactive components

- [ ] Add buttons and select menus with `ActionRowBuilder` + `ButtonBuilder` / `StringSelectMenuBuilder`
- [ ] Handle component interactions (`isButton()`, `isStringSelectMenu()`) in `interactionCreate.js`
- [ ] Give each component a unique `customId` for routing
- [ ] Consider collectors for time-limited interactions

### 8. Modals

- [ ] Build modals with `ModalBuilder` + `TextInputBuilder` inside `ActionRowBuilder`
- [ ] Show a modal with `interaction.showModal()`
- [ ] Handle submissions via `isModalSubmit()` and read fields with `fields.getTextInputValue()`

### 9. GitHub Actions webhook integration

- [ ] Create a Discord channel webhook (or use a bot channel message) for notifications
- [ ] Add the webhook URL as a GitHub Actions secret (never commit it)
- [ ] Wire up a workflow step that POSTs to the webhook (embed with commit, author, status, run URL)
- [ ] Format the payload as a rich embed for readable notifications

### 10. Production hardening

- [ ] Centralize error handling and logging (`process.on('unhandledRejection')`, etc.)
- [ ] Validate all environment variables/secrets on startup
- [ ] Add graceful shutdown handling
- [ ] Choose a hosting/deployment target (VPS, container, or serverless) and keep the process alive
- [ ] Document setup and usage in this README

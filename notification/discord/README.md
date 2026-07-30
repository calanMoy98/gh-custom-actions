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

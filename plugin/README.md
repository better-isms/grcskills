# plugin/

MCP server configuration for the `grcskills` Claude Code plugin.

- The plugin manifest lives at `.claude-plugin/plugin.json` (Claude Code reads it there, at the plugin root, and component paths cannot leave that root). It lists every `skills/<author>/` folder and points `mcpServers` at `plugin/.mcp.json`.
- `.mcp.json` holds one server: the ISMS Copilot remote MCP, by public URL only. There is no token, header or command in this repo; Claude Code asks you to sign in (OAuth) the first time a skill uses it, and you can decline. Every skill works without it.
- The file sits here, not at the repo root, so cloning the repo and opening an agent in it does not register a project MCP server.

The validator (`tools/validate.mjs`, rules `plugin-skills` and `plugin-mcp`) fails if an author folder is missing from the manifest or if the MCP entry carries anything but the public URL.

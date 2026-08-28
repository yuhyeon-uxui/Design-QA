# Design QA MCP Server

This is an MCP (Model Context Protocol) server that allows your AI agent (Claude, Cursor, Antigravity, etc.) to access the Design-QA Firestore Database directly. 
With this, you can ask your AI to fetch active issues, summarize QA status, and help you track your tasks without leaving your editor.

## Features
- `list_projects`: Lists all Design-QA projects.
- `get_project_issues`: Fetches all pins/issues across all screens for a specific project.

## Installation

```bash
cd mcp-server
npm install
```

## Running the Server

```bash
npm start
```

## Configuration for Claude Desktop / Cursor

Add the following to your MCP client's configuration file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "design-qa": {
      "command": "node",
      "args": ["/absolute/path/to/Design-QA/mcp-server/index.js"]
    }
  }
}
```

Now you can ask your AI:
- "What are the remaining Design QA issues?"
- "List the current projects in Design QA."

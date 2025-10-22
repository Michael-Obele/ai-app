# Shadcn Svelte MCP Server

This is a Model Context Protocol (MCP) server that provides access to shadcn-svelte documentation and components. It allows AI assistants to search and retrieve documentation, component information, and usage examples.

## Features

- **Component Documentation**: Access detailed docs for all shadcn-svelte components
- **Installation Guides**: Get installation instructions for different frameworks
- **Migration Guides**: Access migration documentation
- **Registry Information**: Browse component registry and dependencies
- **Search Functionality**: Search through all documentation
- **Schema Validation**: Uses Valibot for robust input validation

## Available Tools

### shadcn-svelte-docs

Search and retrieve shadcn Svelte component documentation.

**Parameters:**

- `query` (string): What you're looking for in the docs
- `component` (optional string): Specific component name for detailed info
- `category` (optional): Filter by category (components, installation, migration, registry, dark-mode)

## Development

### Running Locally

#### Stdio Mode (for MCP clients)

```bash
npm run mcp:stdio
```

#### HTTP Development Server

```bash
npm run mcp:dev
```

Server will run on http://localhost:3000

#### Production Server

```bash
npm run mcp:prod
```

### Testing the Server

You can test the server using curl:

```bash
# Test the HTTP endpoint
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "shadcn-svelte-docs",
      "arguments": {
        "query": "button component"
      }
    }
  }'
```

## MCP Client Configuration

### Cursor

Add to your MCP settings:

```json
{
  "mcpServers": {
    "shadcn-svelte": {
      "command": "npx",
      "args": ["tsx", "/path/to/your/project/src/index.ts"]
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "shadcn-svelte": {
      "command": "npx",
      "args": ["tsx", "/path/to/your/project/src/index.ts"]
    }
  }
}
```

### HTTP Mode

For web-based MCP clients:

```json
{
  "mcpServers": {
    "shadcn-svelte": {
      "url": "https://your-domain.com/mcp"
    }
  }
}
```

## Deployment

### Railway/Render/Fly.io

1. Build your project: `npm run build`
2. Start with: `npm run mcp:prod`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "mcp:prod"]
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- `BASE_URL`: Base URL for the server (for HTTP mode)

## Usage Examples

### Get Button Component Info

```
Query: "button component"
Component: "button"
```

### Search Installation Guides

```
Query: "install with sveltekit"
Category: "installation"
```

### Get Migration Info

```
Query: "migrate to svelte 5"
Category: "migration"
```

### Browse All Components

```
Query: "list all components"
```

## Documentation Structure

The server serves documentation from:

## Project Structure

- `src/mastra/mcp-server.ts`: Main MCP server definition
- `src/mastra/tools/`: Tool implementations
- `src/mastra/docs/content/`: Markdown documentation files
- `src/mastra/docs/registry.json`: Component registry with dependencies and file info

Categories include:

- `components/`: Individual component documentation
- `installation/`: Setup guides for different frameworks
- `migration/`: Migration guides
- `registry/`: Registry usage and API
- `dark-mode/`: Dark mode implementation

## Contributing

## Extending the Server

1. Add new documentation to `src/mastra/docs/content/`
2. Update `src/mastra/docs/registry.json` for new components
3. Test with `npm run mcp:dev`
4. Submit a pull request

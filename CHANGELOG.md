## [1.0.2](https://github.com/Michael-Obele/shadcn-svelte-mcp/compare/v1.0.1...v1.0.2) (2025-10-23)


### Bug Fixes

* add conventional-changelog-conventionalcommits dependency in package.json and bun.lock ([0be88fe](https://github.com/Michael-Obele/shadcn-svelte-mcp/commit/0be88fe5e70f392de268ae1cea64fc677bf6f7b0))
* add Node.js setup step in semantic-release workflow ([42c73fb](https://github.com/Michael-Obele/shadcn-svelte-mcp/commit/42c73fbeee9420104da6931502cc043b679e2f0f))
* change dependency installation from bun to npm in semantic-release workflow ([a9f162f](https://github.com/Michael-Obele/shadcn-svelte-mcp/commit/a9f162f30ab910dcce642ed61d32397b5e8f1b43))
* switch from Node.js to Bun for setup and dependency installation in semantic-release workflow ([6ab14f8](https://github.com/Michael-Obele/shadcn-svelte-mcp/commit/6ab14f82f36f44ffd1bb659f900b60eb5e72f5d8))
* update Node.js version to 24.10.0 in semantic-release workflow ([8b61613](https://github.com/Michael-Obele/shadcn-svelte-mcp/commit/8b6161330b8b4c00a7c882286d9c6db585a59b0e))


### Features

* add script to update version in mcp-server.ts based on package.json ([83b4e0a](https://github.com/Michael-Obele/shadcn-svelte-mcp/commit/83b4e0abd8c936b08d14c5c98c8d5aa994b3d151))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added

- Production deployment on Mastra Cloud (https://shadcn-svelte.mastra.cloud)
- Three powerful MCP tools for shadcn-svelte components:
  - `shadcnSvelteListTool` - List all components and documentation
  - `shadcnSvelteGetTool` - Get detailed component documentation
  - `shadcnSvelteUtilityTool` - Installation, theming, and migration help
- Support for multiple AI code editors (Cursor, Windsurf, VS Code, Zed, Claude Code, Codex)
- HTTP and SSE transport protocols
- Comprehensive component registry with 59+ components
- Complete installation documentation for all major editors
- GitHub Actions workflows for automated versioning and releases

### Changed

- Renamed MCP server from "Shadcn Svelte Documentation Server" to "Shadcn Svelte Docs"
- Simplified architecture to MCP Server only (removed optional MCP Client)
- Updated README with v1.0.0 announcement and editor installation guides

### Removed

- MCP Client implementation (not needed for this project's use case)
- Example MCP agent that used external tools
- Test script for MCP client

### Fixed

- Clarified "Tool not found" error is UI display issue, not server configuration
- Updated documentation to distinguish between MCP Server and MCP Client roles

## [0.1.0] - Initial Development

### Added

- Initial Mastra-based MCP server implementation
- Component documentation registry
- Basic tool implementations
- Development and testing infrastructure

# Hacker News MCP Server

A Model Context Protocol (MCP) server that provides access to Hacker News data through HTTP/SSE transport. This server implements the MCP specification and offers both MCP tools/resources and direct HTTP API endpoints for accessing Hacker News content.

You can use this by adding a Claude Integration that points to `https://hn-mcp.losfair.deno.net/sse`.

## Features

### MCP Tools
- **get_item** - Retrieve any Hacker News item (story, comment, job, etc.) by ID
- **get_user** - Get user profile information by username
- **get_top_stories** - Fetch top stories with configurable limit
- **get_new_stories** - Fetch newest stories with configurable limit  
- **get_best_stories** - Fetch best stories with configurable limit
- **get_ask_stories** - Fetch Ask HN stories with configurable limit
- **get_show_stories** - Fetch Show HN stories with configurable limit
- **get_job_stories** - Fetch job postings with configurable limit
- **get_item_with_comments** - Get an item with nested comments (configurable depth)
- **get_max_item_id** - Get the current maximum item ID from Hacker News
- **get_updates** - Get recently changed items and user profiles

### MCP Resources
- `hn://stories/top` - Top stories resource
- `hn://stories/new` - New stories resource  
- `hn://stories/best` - Best stories resource
- `hn://stories/ask` - Ask HN stories resource
- `hn://stories/show` - Show HN stories resource
- `hn://stories/job` - Job stories resource

### HTTP API Endpoints
- `GET /health` - Health check endpoint
- `GET /api/item/:id` - Get item by ID
- `GET /api/user/:username` - Get user by username
- `GET /api/stories/:type?limit=N` - Get stories by type (top, new, best, ask, show, job)

### OAuth 2.0 Endpoints (Testing)
- `GET /authorize` - OAuth authorization endpoint (dummy implementation)
- `POST /token` - OAuth token endpoint (dummy implementation)  
- `POST /register` - OAuth client registration endpoint (dummy implementation)

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The server will start on port 3000 (or PORT environment variable) and provide:
- MCP SSE endpoint at `/sse` (requires Bearer token authentication)
- MCP message endpoint at `/message` (requires Bearer token authentication)
- Direct HTTP API endpoints for testing

### Authentication

For MCP endpoints, use Bearer token authentication:
```
Authorization: Bearer dummy-bearer-token-12345
```

### Testing with Claude.ai

1. Start the server: `npm run dev`
2. In Claude.ai, add the MCP server URL: `http://localhost:3000/sse`
3. Use the Bearer token: `dummy-bearer-token-12345`

## API Examples

### Get a story with comments
```bash
curl "http://localhost:3000/api/item/1" 
```

### Get top 10 stories
```bash
curl "http://localhost:3000/api/stories/top?limit=10"
```

### Get user profile
```bash
curl "http://localhost:3000/api/user/pg"
```

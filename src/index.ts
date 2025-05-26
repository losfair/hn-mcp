#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HackerNewsClient } from './hn-client.js';
import { authMiddleware, generateDummyToken } from './auth.js';

const hnClient = new HackerNewsClient();

// Global map to store SSEServerTransport instances by sessionId
const transportMap = new Map<string, SSEServerTransport>();


function initServer(server: Server) {
  // Define tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_item',
          description: 'Get a Hacker News item (story, comment, job, etc.) by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'The item ID',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_user',
          description: 'Get a Hacker News user profile by username',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'The username',
              },
            },
            required: ['username'],
          },
        },
        {
          name: 'get_top_stories',
          description: 'Get top stories from Hacker News',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of stories to return (default: 30)',
                default: 30,
              },
            },
          },
        },
        {
          name: 'get_new_stories',
          description: 'Get new stories from Hacker News',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of stories to return (default: 30)',
                default: 30,
              },
            },
          },
        },
        {
          name: 'get_best_stories',
          description: 'Get best stories from Hacker News',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of stories to return (default: 30)',
                default: 30,
              },
            },
          },
        },
        {
          name: 'get_ask_stories',
          description: 'Get Ask HN stories',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of stories to return (default: 30)',
                default: 30,
              },
            },
          },
        },
        {
          name: 'get_show_stories',
          description: 'Get Show HN stories',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of stories to return (default: 30)',
                default: 30,
              },
            },
          },
        },
        {
          name: 'get_job_stories',
          description: 'Get job stories from Hacker News',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of stories to return (default: 30)',
                default: 30,
              },
            },
          },
        },
        {
          name: 'get_item_with_comments',
          description: 'Get a Hacker News item with its comments (nested)',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'The item ID',
              },
              maxDepth: {
                type: 'number',
                description: 'Maximum depth of comments to fetch (default: 2)',
                default: 2,
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_max_item_id',
          description: 'Get the current maximum item ID',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_updates',
          description: 'Get recently changed items and profiles',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'get_item': {
          const { id } = args as { id: number };
          const item = await hnClient.getItem(id);
          return {
            content: [
              {
                type: 'text',
                text: item ? JSON.stringify(item, null, 2) : `Item ${id} not found`,
              },
            ],
          };
        }

        case 'get_user': {
          const { username } = args as { username: string };
          const user = await hnClient.getUser(username);
          return {
            content: [
              {
                type: 'text',
                text: user ? JSON.stringify(user, null, 2) : `User ${username} not found`,
              },
            ],
          };
        }

        case 'get_top_stories': {
          const { limit = 30 } = args as { limit?: number };
          const stories = await hnClient.getStories('top', limit);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stories, null, 2),
              },
            ],
          };
        }

        case 'get_new_stories': {
          const { limit = 30 } = args as { limit?: number };
          const stories = await hnClient.getStories('new', limit);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stories, null, 2),
              },
            ],
          };
        }

        case 'get_best_stories': {
          const { limit = 30 } = args as { limit?: number };
          const stories = await hnClient.getStories('best', limit);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stories, null, 2),
              },
            ],
          };
        }

        case 'get_ask_stories': {
          const { limit = 30 } = args as { limit?: number };
          const stories = await hnClient.getStories('ask', limit);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stories, null, 2),
              },
            ],
          };
        }

        case 'get_show_stories': {
          const { limit = 30 } = args as { limit?: number };
          const stories = await hnClient.getStories('show', limit);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stories, null, 2),
              },
            ],
          };
        }

        case 'get_job_stories': {
          const { limit = 30 } = args as { limit?: number };
          const stories = await hnClient.getStories('job', limit);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stories, null, 2),
              },
            ],
          };
        }

        case 'get_item_with_comments': {
          const { id, maxDepth = 2 } = args as { id: number; maxDepth?: number };
          const item = await hnClient.getItemWithComments(id, maxDepth);
          return {
            content: [
              {
                type: 'text',
                text: item ? JSON.stringify(item, null, 2) : `Item ${id} not found`,
              },
            ],
          };
        }

        case 'get_max_item_id': {
          const maxId = await hnClient.getMaxItem();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ maxItemId: maxId }, null, 2),
              },
            ],
          };
        }

        case 'get_updates': {
          const updates = await hnClient.getUpdates();
          return {
            content: [
              {
                type: 'text',
                text: updates ? JSON.stringify(updates, null, 2) : 'No updates found',
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Define resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'hn://stories/top',
          mimeType: 'application/json',
          name: 'Top Stories',
          description: 'Current top stories from Hacker News',
        },
        {
          uri: 'hn://stories/new',
          mimeType: 'application/json',
          name: 'New Stories',
          description: 'Latest new stories from Hacker News',
        },
        {
          uri: 'hn://stories/best',
          mimeType: 'application/json',
          name: 'Best Stories',
          description: 'Best stories from Hacker News',
        },
        {
          uri: 'hn://stories/ask',
          mimeType: 'application/json',
          name: 'Ask HN Stories',
          description: 'Ask HN stories',
        },
        {
          uri: 'hn://stories/show',
          mimeType: 'application/json',
          name: 'Show HN Stories',
          description: 'Show HN stories',
        },
        {
          uri: 'hn://stories/job',
          mimeType: 'application/json',
          name: 'Job Stories',
          description: 'Job postings from Hacker News',
        },
      ],
    };
  });

  // Handle resource reads
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (!uri.startsWith('hn://stories/')) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    const type = uri.split('/')[2] as any;
    const stories = await hnClient.getStories(type, 30);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(stories, null, 2),
        },
      ],
    };
  });
}

// HTTP server setup
async function startHttpServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      name: 'hn-mcp-server',
      version: '1.0.0'
    });
  });

  // Dummy token endpoint for testing
  app.post('/token', (req, res) => {
    res.json({
      access_token: generateDummyToken(),
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: "dummy",
      scope: 'read'
    });
  });

  // Dummy authorization endpoint
  app.get('/authorize', (req, res) => {
    const { client_id, redirect_uri, response_type, state } = req.query;

    if (response_type !== 'code') {
      res.status(400).json({
        error: 'unsupported_response_type',
        error_description: 'Only code response type is supported'
      });
      return;
    }

    const code = 'dummy-auth-code-12345';
    const redirectUrl = `${redirect_uri}?code=${code}${state ? `&state=${state}` : ''}`;
    res.redirect(redirectUrl);
  });

  // Dummy client registration endpoint
  app.post('/register', (req, res) => {
    const { client_name, redirect_uris, grant_types, response_types, scope } = req.body;

    if (!client_name) {
      res.status(400).json({
        error: 'invalid_client_metadata',
        error_description: 'client_name is required'
      });
      return;
    }

    if (!redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      res.status(400).json({
        error: 'invalid_redirect_uri',
        error_description: 'redirect_uris must be a non-empty array'
      });
      return;
    }

    const client_id = `dummy-client-${Date.now()}`;
    const client_secret = `dummy-secret-${Math.random().toString(36).substring(2)}`;

    res.status(201).json({
      client_id,
      client_secret,
      client_name,
      redirect_uris,
      grant_types: grant_types || ['authorization_code'],
      response_types: response_types || ['code'],
      scope: scope || 'read',
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_secret_expires_at: 0
    });
  });

  // Origin validation middleware
  function validateOrigin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const origin = req.get('origin');
    const allowedOrigins = [
      'https://claude.ai',
      'https://claude.anthropic.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      res.status(403).json({ error: 'Forbidden origin' });
      return;
    }

    next();
  }

  // SSE endpoint for MCP transport using official SDK
  app.get('/sse', validateOrigin, authMiddleware, async (req, res) => {
    const transport = new SSEServerTransport('/message', res);

    // Create MCP server
    const server = new Server(
      {
        name: 'hn-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    initServer(server);
    await server.connect(transport);

    const intervalId = setInterval(() => {
      res.write(`: heartbeat\n\n`);
    }, 5000);

    // Store transport in global map using sessionId
    transportMap.set(transport.sessionId, transport);
    server.onclose = () => {
      console.log(`Transport closed for sessionId: ${transport.sessionId}`);
      transportMap.delete(transport.sessionId);
      clearInterval(intervalId);
    }
  });

  // HTTP POST endpoint for client messages
  app.post('/message', validateOrigin, authMiddleware, async (req, res) => {
    try {
      const sessionId = req.query.sessionId;

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'sessionId is required' });
        return;
      }

      // Look up the original transport from the global map
      const transport = transportMap.get(sessionId);

      if (!transport) {
        res.status(404).json({ error: 'Transport not found for sessionId' });
        return;
      }

      console.log(`Handling message for sessionId: ${sessionId}:`, req.body);
      await transport.handleMessage(req.body);
      res.writeHead(202).end("Accepted");
    } catch (error) {
      console.error('Error handling message:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Convenience endpoints for direct HTTP access
  app.get('/api/item/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await hnClient.getItem(id);
      res.json(item || { error: `Item ${id} not found` });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get('/api/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await hnClient.getUser(username);
      res.json(user || { error: `User ${username} not found` });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get('/api/stories/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const stories = await hnClient.getStories(type as any, limit);
      res.json(stories);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.listen(port, () => {
    console.log(`Hacker News MCP server running on http://localhost:${port}`);
    console.log(`Available endpoints:`);
    console.log(`  GET  /health - Health check`);
    console.log(`  GET  /sse - MCP SSE transport (requires Bearer token)`);
    console.log(`  POST /messages - MCP message endpoint (requires Bearer token)`);
    console.log(`  GET  /authorize - OAuth authorization`);
    console.log(`  POST /token - OAuth token endpoint`);
    console.log(`  POST /register - OAuth client registration`);
    console.log(`  GET  /api/item/:id - Get item by ID`);
    console.log(`  GET  /api/user/:username - Get user by username`);
    console.log(`  GET  /api/stories/:type?limit=N - Get stories (top, new, best, ask, show, job)`);
    console.log(`\nFor testing: Use Bearer token "dummy-bearer-token-12345"`);
    console.log(`\nMCP SSE URL for Claude.ai: http://localhost:${port}/sse`);
  });
}

async function main() {
  await startHttpServer();
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
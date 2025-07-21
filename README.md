# Rize.io MCP Server

A comprehensive Model Context Protocol (MCP) server for integrating Rize.io productivity tracking with Claude Desktop.

## Features

- 📊 **Productivity Metrics**: Access comprehensive productivity analytics
- 🎯 **Focus Sessions**: Track and analyze focus sessions with detailed insights
- 📁 **Project Management**: Create and manage projects for time tracking
- 📈 **Analytics Reports**: Generate detailed analytics reports with AI insights
- 🔄 **Real-time Data**: Access current productivity data and metrics
- 🛡️ **Type Safety**: Full TypeScript implementation with comprehensive error handling

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rize-mcp-server.git
cd rize-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Rize.io API key
```

4. Build the project:
```bash
npm run build
```

## Configuration

### Required Environment Variables

- `RIZE_API_KEY`: Your Rize.io API key (required)

### Optional Environment Variables

- `LOG_LEVEL`: Logging level (default: 'info')
- `CACHE_MAX_SIZE`: Maximum cache size (default: 1000)
- `CACHE_TTL`: Cache time-to-live in milliseconds (default: 300000)
- `RATE_LIMITING`: Enable rate limiting (default: true)
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 100)
- `RATE_LIMIT_WINDOW`: Rate limiting window in milliseconds (default: 60000)

## Usage with Claude Desktop

1. Add the server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "rize": {
      "command": "node",
      "args": ["/path/to/rize-mcp-server/dist/index.js"],
      "env": {
        "RIZE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

2. Restart Claude Desktop to load the server.

## Available Tools

### Core Tools

#### `get_current_user`
Get current user information from Rize.io.

#### `get_productivity_metrics`
Retrieve productivity metrics for a date range.

**Parameters:**
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format
- `category` (string): Category filter (work, personal, all)

#### `get_focus_sessions`
Get focus sessions with filtering options.

**Parameters:**
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format
- `projectId` (string, optional): Project ID filter
- `category` (string): Category filter (work, personal, all)
- `minDuration` (number, optional): Minimum session duration in minutes

#### `get_analytics_report`
Generate comprehensive analytics report.

**Parameters:**
- `timeframe` (string): Time frame (day, week, month)
- `includeInsights` (boolean): Include AI-generated insights

#### `list_projects`
List projects with pagination support.

**Parameters:**
- `limit` (number): Maximum number of projects to return (1-100)
- `cursor` (string, optional): Pagination cursor

#### `create_project`
Create a new project.

**Parameters:**
- `name` (string): Project name
- `description` (string, optional): Project description

#### `get_productivity_summary`
Get daily productivity summary.

**Parameters:**
- `date` (string): Date in YYYY-MM-DD format
- `includeBreakdown` (boolean): Include category breakdown

#### `health_check`
Check server health and API connectivity.

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting and Formatting

```bash
npm run lint
npm run format
```

### Using MCP Inspector

```bash
npm run inspector
```

## Error Handling

The server implements comprehensive error handling:

- **Authentication Errors**: Invalid API keys
- **Validation Errors**: Invalid input parameters
- **API Errors**: Rize.io API failures
- **Rate Limiting**: Request throttling

## Caching

The server implements intelligent caching:

- **LRU Cache**: Least Recently Used cache with configurable size
- **TTL**: Time-to-live based expiration
- **Selective Caching**: Performance-critical operations cached

## Security

- **API Key Validation**: Secure API key handling
- **Input Validation**: Comprehensive parameter validation
- **Error Sanitization**: Safe error message handling
- **Rate Limiting**: Configurable request throttling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/yourusername/rize-mcp-server/issues)
- Documentation: [MCP Documentation](https://modelcontextprotocol.io/) 
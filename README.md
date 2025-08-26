# 🎯 Enterprise Rize.io MCP Server

**Advanced productivity analytics integration with AI assistants through Model Context Protocol**

A production-ready, enterprise-grade MCP server that seamlessly integrates Rize.io's powerful time tracking and productivity analytics with Claude Desktop and other AI assistants. Built with modern TypeScript architecture, comprehensive error handling, and performance optimization.

🌐 **Portfolio Project**: This server demonstrates advanced system architecture, API integration patterns, and enterprise-grade development practices for [mariomosca.com](https://mariomosca.com).

## ✨ Enterprise Features & Architecture

### 🏗️ **Production-Ready Architecture**
- **Modular Service Layer**: Separation of concerns with dedicated services for API, Auth, Cache, and Validation
- **GraphQL Integration**: Advanced GraphQL client with query optimization and response caching  
- **Comprehensive Logging**: Winston-based logging with file rotation and structured error tracking
- **Type Safety**: Full TypeScript implementation with Zod validation schemas
- **Performance Optimization**: LRU caching with configurable TTL and intelligent cache invalidation

### 🛡️ **Enterprise Security & Reliability**
- **Authentication Service**: Secure API key management with token validation
- **Input Validation**: Comprehensive parameter validation using Zod schemas
- **Error Handling**: Graceful error recovery with detailed error classification
- **Rate Limiting**: Configurable request throttling and API quota management
- **Health Monitoring**: Built-in health checks and system status reporting

### 📊 **Advanced Analytics Capabilities**
- **Multi-Timeframe Analysis**: Day, week, month analytics with trend analysis
- **Focus Session Intelligence**: Deep session analysis with filtering and categorization
- **Productivity Insights**: AI-powered insights generation and pattern recognition
- **Project Management**: Complete project lifecycle management with metadata tracking
- **Real-time Metrics**: Live productivity data with automated refresh intervals

## 🚀 **Core Productivity Tools**

### **📈 Analytics & Reporting**
| Tool | Purpose | Key Features |
|------|---------|--------------|
| `get_productivity_metrics` | Comprehensive productivity analysis | Date range filtering, category segmentation, trend analysis |
| `get_analytics_report` | Executive-level insights | Multi-timeframe views, AI-generated insights, performance trends |
| `get_productivity_summary` | Daily performance overview | Category breakdown, context switching analysis, distraction metrics |

### **🎯 Focus Session Management** 
| Tool | Purpose | Key Features |
|------|---------|--------------|
| `get_focus_sessions` | Detailed session analysis | Duration filtering, project correlation, productivity scoring |
| `create_project` | Project organization | Metadata management, category assignment, time tracking setup |
| `list_projects` | Project portfolio overview | Pagination support, search capabilities, activity tracking |

### **🔧 System Management**
| Tool | Purpose | Key Features |
|------|---------|--------------|
| `get_current_user` | User profile & preferences | Account validation, settings overview, usage statistics |
| `health_check` | System status monitoring | API connectivity, service health, performance metrics |

## ⚙️ **Advanced Configuration**

### **Environment Variables**
```bash
# Required Configuration
RIZE_API_KEY=your_rize_io_api_key          # Your Rize.io API key

# Performance Optimization
CACHE_MAX_SIZE=1000                         # LRU cache size (default: 1000)
CACHE_TTL=300000                           # Cache TTL in ms (default: 5 minutes)

# Logging Configuration  
LOG_LEVEL=info                             # Logging level (error, warn, info, debug)

# Rate Limiting
RATE_LIMITING=true                         # Enable rate limiting (default: true)
RATE_LIMIT_MAX=100                         # Max requests per window (default: 100)
RATE_LIMIT_WINDOW=60000                    # Rate limit window in ms (default: 1 minute)
```

### **Installation & Setup**

1. **Clone & Install**
```bash
git clone https://github.com/mariomosca/rizeio-mcp-server.git
cd rizeio_mcp_server
npm install
```

2. **Configuration Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env  # Add your Rize.io API key and adjust settings
```

3. **Build & Test**
```bash
# Production build
npm run build

# Development mode with hot reload
npm run dev

# Run comprehensive tests
npm test
```

## 🔌 **Claude Desktop Integration**

### **macOS Configuration**
`~/Library/Application Support/Claude/claude_desktop_config.json`
```json
{
  "mcpServers": {
    "rize-productivity": {
      "command": "node",
      "args": ["/path/to/rizeio_mcp_server/dist/index.js"],
      "env": {
        "RIZE_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "info",
        "CACHE_TTL": "300000"
      }
    }
  }
}
```

### **Windows Configuration**
`%APPDATA%/Claude/claude_desktop_config.json`
```json
{
  "mcpServers": {
    "rize-productivity": {
      "command": "node",
      "args": ["C:\\path\\to\\rizeio_mcp_server\\dist\\index.js"],
      "env": {
        "RIZE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## 💡 **Intelligent Usage Patterns**

### **Daily Productivity Review**
```
Claude: "Show me my productivity summary for yesterday with category breakdown"
→ Uses get_productivity_summary tool
→ Returns comprehensive daily metrics with focus time, sessions, and distractions
```

### **Weekly Performance Analysis**  
```
Claude: "Generate a weekly analytics report with AI insights"
→ Uses get_analytics_report with timeframe="week" and includeInsights=true
→ Returns trend analysis, productivity patterns, and actionable recommendations
```

### **Project-Focused Analysis**
```
Claude: "Show me all focus sessions for my Development project this week, minimum 30 minutes"
→ Uses get_focus_sessions with projectId filter and minDuration=30
→ Returns filtered sessions with productivity metrics and time distribution
```

### **Productivity Optimization**
```
Claude: "What are my most productive hours based on recent focus sessions?"
→ Combines multiple tool calls to analyze session patterns
→ Provides insights on optimal work scheduling and energy management
```

## 🏗️ **Advanced Architecture Details**

### **Service Layer Architecture**
```
src/
├── services/
│   ├── rize-api.ts      - GraphQL client & API integration
│   ├── auth.ts          - Authentication & token management
│   ├── cache.ts         - LRU caching with TTL support
│   └── validation.ts    - Input validation & sanitization
├── utils/
│   ├── formatting.ts    - Response formatting & presentation
│   ├── errors.ts        - Custom error classes & handling
│   └── validation.ts    - Zod schemas & input validation
├── types/
│   └── rize.ts         - TypeScript interfaces & types
└── index.ts            - Server initialization & tool registration
```

### **Caching Strategy**
- **LRU (Least Recently Used)** cache with configurable size limits
- **TTL-based expiration** for time-sensitive data
- **Selective caching** for performance-critical operations
- **Cache warming** for frequently accessed data
- **Automatic invalidation** on data mutations

### **Error Handling Pipeline**
1. **Input Validation**: Zod schema validation with detailed error messages
2. **API Error Classification**: Structured error types (Auth, Validation, Network, etc.)
3. **Graceful Degradation**: Fallback mechanisms for partial failures
4. **Error Logging**: Comprehensive error tracking with context and stack traces
5. **User-Friendly Messages**: Clean error presentation for AI assistant interaction

## 🔬 **Performance & Monitoring**

### **Built-in Metrics**
- **API Response Times**: Track GraphQL query performance
- **Cache Hit Rates**: Monitor caching effectiveness  
- **Error Frequencies**: Identify and track failure patterns
- **Memory Usage**: Monitor cache size and memory consumption
- **Request Volume**: Track API usage patterns and quotas

### **Health Check System**
```bash
# Test server health
npm run health-check

# Response includes:
# - API connectivity status
# - Service health indicators  
# - Performance metrics
# - Version information
```

### **Development Tools**
```bash
# Development server with hot reload
npm run dev

# MCP Inspector for testing
npm run inspector

# Linting and code quality
npm run lint

# Automated formatting
npm run format

# Comprehensive test suite
npm test
```

## 🎯 **AI-Optimized Design**

### **What Makes This Integration Special**

1. **AI-First API Design**: Responses optimized for AI assistant parsing and understanding
2. **Context-Aware Formatting**: Intelligent data presentation based on request context
3. **Natural Language Integration**: Tools designed for conversational AI interaction patterns
4. **Comprehensive Metadata**: Rich data context that enables deeper AI analysis
5. **Performance Optimization**: Sub-second response times for real-time AI conversations

### **Advanced Analytics Intelligence**
- **Pattern Recognition**: Identify productivity patterns and trends across time periods
- **Predictive Insights**: AI-generated recommendations based on historical data
- **Comparative Analysis**: Cross-project and cross-timeframe performance comparisons
- **Behavioral Analytics**: Deep insights into work habits and focus patterns
- **Optimization Suggestions**: Data-driven recommendations for productivity improvements

## 🚀 **Development Excellence**

This project showcases **cutting-edge development practices**:

### **Modern TypeScript Patterns**
- **Advanced Type System**: Comprehensive type safety with complex generic types
- **Decorator Patterns**: Elegant service composition and dependency injection
- **Async/Await Mastery**: Sophisticated asynchronous operation handling
- **Error Boundary Design**: Comprehensive error handling with recovery strategies

### **Enterprise Architecture**  
- **Microservice-Ready**: Modular design suitable for distributed systems
- **API Gateway Patterns**: Request routing and transformation capabilities
- **Event-Driven Architecture**: Extensible event system for future integrations
- **Observability**: Built-in monitoring, logging, and debugging capabilities

### **Performance Engineering**
- **Memory Optimization**: Efficient data structures and garbage collection patterns
- **Caching Strategies**: Multi-layer caching with intelligent invalidation
- **Connection Pooling**: Optimized API client management
- **Load Balancing Ready**: Stateless design suitable for horizontal scaling

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] **Real-time Notifications**: WebSocket support for live productivity updates
- [ ] **Advanced Visualizations**: Chart generation and data visualization tools
- [ ] **Machine Learning Integration**: Predictive productivity modeling
- [ ] **Multi-Account Support**: Enterprise team and organization management
- [ ] **Custom Analytics**: User-defined metrics and KPI tracking
- [ ] **Integration Ecosystem**: Connect with calendar, email, and task management tools

### **API Expansion**
- [ ] **Webhook Support**: Real-time event notifications and integrations  
- [ ] **Batch Operations**: Efficient bulk data processing and updates
- [ ] **Advanced Filtering**: Complex query capabilities and search functions
- [ ] **Export Capabilities**: Data export in multiple formats (CSV, JSON, PDF)
- [ ] **Historical Analysis**: Long-term trend analysis and yearly comparisons

## 🏆 **Technical Showcase**

This MCP server demonstrates expertise in:

- **Enterprise-Grade Architecture**: Production-ready system design and implementation
- **Advanced TypeScript Development**: Complex type systems and modern JavaScript patterns
- **GraphQL Mastery**: Efficient query optimization and response caching
- **Performance Engineering**: Caching strategies, memory optimization, and scalability
- **API Integration Patterns**: RESTful and GraphQL API consumption and management
- **Production Monitoring**: Comprehensive logging, error handling, and health monitoring
- **AI-Assistant Integration**: Optimized design for AI assistant interaction patterns

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 **Contributing** 

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for development setup and submission guidelines.

---

**Built with ⚡ by [Mario Mosca](https://mariomosca.com) - Demonstrating enterprise-grade AI integration architecture**
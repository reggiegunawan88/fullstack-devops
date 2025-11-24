# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fullstack monorepo application built with Turborepo, featuring a React 19 (RC) + Vite frontend and HonoJS backend. The project uses pnpm workspaces for package management.

**Tech Stack:**

- Monorepo: Turborepo 2.0
- Package Manager: pnpm 9.0.0+
- Frontend: React 19 RC, Vite, TypeScript
- Backend: HonoJS, Node.js, TypeScript
- Requirements: Node.js 18+

### Agent Usage Policy

**IMPORTANT**: Always use custom subagents proactively to improve token efficiency and enable more effective collaboration. Subagents reduce main agent context usage, enable parallel execution, and allow longer productive conversations.

#### Custom Subagents

The project includes custom agent configurations in `.claude/agents/` directory:

1. **codebase-locator** (Tools: Grep, Glob, LS | Model: sonnet)
   - Purpose: Find files, directories, and components by feature or pattern
   - Use when: Searching for code locations, exploring file structures, locating related components
   - Behavior: Acts as a "Super Grep/Glob/LS tool" for complex searches

2. **codebase-analyzer** (Tools: Read, Grep, Glob, LS | Model: sonnet)
   - Purpose: Analyze implementation details and understand code architecture
   - Use when: Need to understand how features work, analyze code patterns, deep-dive into implementations
   - Behavior: Provides detailed analysis with file paths and line numbers

3. **codebase-pattern-finder** (Tools: Grep, Glob, Read, LS | Model: sonnet)
   - Purpose: Find similar implementations, usage examples, and existing patterns to model after
   - Use when: Need concrete code examples, looking for established patterns, finding similar features
   - Behavior: Returns actual code snippets with file:line references, not just file locations

4. **web-search-researcher** (Tools: WebSearch, WebFetch, TodoWrite, Read, Grep, Glob, LS | Model: sonnet)
   - Purpose: Research modern information from web sources
   - Use when: Need current information beyond training data, API documentation, best practices, technical solutions
   - Behavior: Performs strategic web searches, fetches and analyzes content, synthesizes findings with citations

5. **thoughts-locator** (Tools: Grep, Glob, LS | Model: sonnet)
   - Purpose: Discover relevant documents in `thoughts/` directory (research, plans, tickets, notes)
   - Use when: Need to find historical context, RPI documentation, past decisions, meeting notes
   - Behavior: The `thoughts/` equivalent of `codebase-locator`, finds and categorizes documentation

6. **thoughts-analyzer** (Tools: Read, Grep, Glob, LS | Model: sonnet)
   - Purpose: Deep analysis of research documents in `thoughts/` directory
   - Use when: Need to extract key decisions, constraints, technical specs from RPI docs
   - Behavior: The `thoughts/` equivalent of `codebase-analyzer`, extracts actionable insights

#### When to Use Subagents

**Always prefer subagents for:**

- Code exploration tasks → Use `codebase-locator`
- Implementation analysis → Use `codebase-analyzer`
- Finding code patterns/examples → Use `codebase-pattern-finder`
- Web research for current information → Use `web-search-researcher`
- Finding RPI documentation → Use `thoughts-locator`
- Analyzing RPI documents → Use `thoughts-analyzer`
- Multi-file searches requiring multiple grep/glob rounds → Use `Explore` or `codebase-locator`
- Complex codebase questions that need context gathering

**Use subagents in parallel when:**

- Tasks are independent and can run concurrently
- Analyzing multiple features or components simultaneously
- Gathering information from different parts of the codebase
- Example: Run `codebase-locator` + `thoughts-locator` in parallel for comprehensive context

**Avoid subagents for:**

- Reading a single specific file (use Read tool directly)
- Simple one-off grep/glob queries with obvious targets
- Trivial questions that don't require file exploration
- Information you're confident about (no need for web-search-researcher)

#### Benefits of Using Subagents

1. **Token Efficiency**:
   - Subagents work in isolated, temporary context
   - Only summaries returned to main agent context
   - Main conversation context stays lean and focused
   - Enables much longer productive sessions

2. **Performance**:
   - Multiple subagents can run in parallel
   - Faster results through concurrent execution
   - No blocking on sequential file operations

3. **Better Organization**:
   - Each subagent specializes in specific tasks
   - Clear separation of concerns
   - Focused context leads to better results

4. **Scalability**:
   - Handle larger codebases without context overflow
   - Analyze multiple features in single session
   - Support complex, multi-step workflows

#### Usage Pattern

User asks naturally (no special syntax needed):

- "How does the chat citation system work?"
- "Find all Reddit data source files"
- "Where is the periodic report generation implemented?"

Claude automatically:

1. Identifies the task type
2. Selects appropriate subagent(s)
3. Delegates with specific instructions
4. Presents synthesized results to user

#### Agent Model Selection

Custom agents have default models specified in their configuration files (`.claude/agents/*.md`). When calling agents via the Task tool:

**Best Practice**:

- **Omit the `model` parameter** to use the agent's configured default model
- The agent author has chosen the optimal model for the agent's tasks
- Respecting the default ensures consistent, high-quality results

**When to Override**:

- **Specify `model: "haiku"`** only for simple, straightforward tasks where speed/cost is critical
- **Specify `model: "sonnet"`** or **`model: "opus"`** if you need capabilities beyond the default
- Override sparingly and with specific justification

**Example**:

```typescript
// ✅ Correct - Uses agent's default model (sonnet for codebase-locator)
{
  "subagent_type": "codebase-locator",
  "prompt": "Find all periodic report files",
  "description": "Locate report files"
}

// ❌ Incorrect - Unnecessarily overrides to haiku
{
  "subagent_type": "codebase-locator",
  "prompt": "Find all periodic report files",
  "description": "Locate report files",
  "model": "haiku"  // Override may reduce quality
}
```

**Note**: The `model` parameter in Task tool calls overrides the agent's configured default. When in doubt, trust the agent's default configuration.

## Architecture

### Monorepo Structure

The project follows a typical Turborepo apps-based structure:

- `apps/backend/` - HonoJS API server (port 3001)
- `apps/frontend/` - React 19 + Vite app (port 3000)

### Communication Pattern

The frontend uses Vite's proxy configuration to forward `/api/*` requests to the backend:

- Frontend dev server: `http://localhost:3000`
- Backend API server: `http://localhost:3001`
- API proxy: Frontend's [vite.config.ts](apps/frontend/vite.config.ts#L9-L14) proxies `/api` to backend
- CORS: Backend enables CORS in [index.ts](apps/backend/src/index.ts#L8) for cross-origin requests

### Backend API Endpoints

Available in [apps/backend/src/index.ts](apps/backend/src/index.ts):

- `GET /` - Root endpoint listing available APIs
- `GET /api/health` - Health check with timestamp
- `GET /api/hello` - Simple greeting message
- `GET /api/info` - Application metadata (framework, deployment info, node version, platform, uptime, API endpoint)

### Environment Variables

Backend uses environment variables loaded via `process.env`:

- Configuration in [apps/backend/.env](apps/backend/.env)
- Template available in [apps/backend/.env.example](apps/backend/.env.example)
- Variables: `PORT`, `API_ENDPOINT`, `DEPLOYED_ON`

### Frontend-Backend Integration

The frontend [App.tsx](apps/frontend/src/App.tsx) demonstrates the integration pattern:

- Fetches data from all three API endpoints in parallel using `Promise.all()`
- Uses TypeScript interfaces for API response types
- Implements loading and error states
- Makes relative `/api/*` calls that Vite proxies to backend

## Common Commands

### Development

```bash
# Install all dependencies (must use pnpm)
pnpm install

# Start both frontend and backend in dev mode with hot reloading
pnpm dev

# Run type checking across all apps
pnpm type-check

# Format code with Prettier
pnpm format
```

### Individual App Development

```bash
# Frontend only (from apps/frontend/)
pnpm dev          # Starts on port 3000

# Backend only (from apps/backend/)
pnpm dev          # Starts on port 3001 with tsx watch
```

### Building

```bash
# Build all apps (respects dependency order via Turborepo)
pnpm build

# Build outputs:
# - Frontend: apps/frontend/dist/
# - Backend: apps/backend/dist/
```

### Production

```bash
# Start production servers (must build first)
pnpm start

# Frontend preview: http://localhost:3000
# Backend: http://localhost:3001
```

## Turborepo Configuration

The [turbo.json](turbo.json) defines the task pipeline:

- **`build`**: Has `dependsOn: ["^build"]` ensuring dependencies build first
- **`dev`**: Marked as `persistent: true` and `cache: false` for long-running dev servers
- **`start`**: Depends on build task completing first
- **Global dependencies**: Tracks `**/.env.*local` files

## Development Notes

### Adding New API Endpoints

1. Add route handler in [apps/backend/src/index.ts](apps/backend/src/index.ts)
2. Ensure CORS is enabled (already configured globally)
3. Frontend can call via relative `/api/*` path (proxied automatically)
4. Add TypeScript interface in frontend if needed

### Frontend State Management

Currently uses React hooks (`useState`, `useEffect`) with no external state library. The app demonstrates:

- Parallel API fetching
- Loading/error state handling
- TypeScript type safety for API responses

### TypeScript Configuration

Each app has its own `tsconfig.json`:

- Backend: Configured for Node.js with HonoJS
- Frontend: Configured for React with Vite

### Package Management

- **Always use `pnpm`** (enforced via `packageManager` field)
- Root `pnpm-workspace.yaml` defines workspace packages
- Dependencies are hoisted where possible
- Each app maintains its own `package.json`

## Port Configuration

- Frontend dev: 3000 (configured in [vite.config.ts](apps/frontend/vite.config.ts#L8))
- Backend dev: 3001 (configured in [index.ts](apps/backend/src/index.ts#L45))
- Both are configurable via environment variables

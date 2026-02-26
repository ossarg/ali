# Stack Research

**Domain:** Legal AI / Litigation Automation
**Researched:** February 26, 2026
**Confidence:** HIGH

## Recommended Stack

### Core AI Agent Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **CrewAI** | 0.203+ | Multi-agent orchestration | Best fit for role-based legal workflows. Agents map directly to legal roles (triage, drafting, assignment). Sequential/parallel task execution fits litigation pipelines. Python 3.10-3.13 required. |
| **LangGraph** | 1.0+ | Complex workflow orchestration | Use for complex stateful flows requiring fine-grained control over agent state, memory, and branching logic. LangChain v1.0 released Oct 2025 requires Python 3.10+. |
| **Pydantic AI** | 0.1+ | Agent development | Fastest growing agent framework in 2025 (8M downloads/month). Model-agnostic, built by Pydantic team. Excellent for structured outputs needed in legal document generation. |

**Decision:** Start with CrewAI for the coordinator pattern (multi-agent with specialized sub-agents). Migrate to LangGraph if complex branching/conditional logic is needed later.

### Document Processing

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| **PyMuPDF (fitz)** | 1.27+ | PDF text extraction | Primary PDF processing. High performance, handles scanned docs. |
| **pymupdf4llm** | Latest | Markdown extraction | Best for LLM ingestion - outputs clean markdown with layout preservation. |
| **pdfplumber** | 0.11+ | Table extraction | When legal documents contain complex tables (damages calculations, schedules). |
| **marker-pdf** | Latest | PDF to markdown | Highest accuracy for complex legal documents with mixed content. |
| **pytesseract** | Latest | OCR | Only for scanned/image-based documents requiring OCR. |

**Decision:** Stack `pymupdf4llm` (primary) + `pdfplumber` (tables) + `pytesseract` (OCR fallback).

### Vector Database (RAG)

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| **pgvector** | Latest | Vector search in PostgreSQL | Best if Libra has existing PostgreSQL infrastructure. Unified data model. |
| **ChromaDB** | Latest | Embedded vector DB | Simplest for prototyping. Not recommended for production at scale. |
| **Qdrant** | Latest | Vector search engine | Best balance of performance and filtering. Good free tier. |
| **Pinecone** | Latest | Managed vector DB | Enterprise-grade, zero ops. Higher cost. |

**Decision:** Use `pgvector` if PostgreSQL exists. Otherwise Qdrant (self-hosted) or Pinecone (managed) for production.

### Backend API

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **FastAPI** | 0.115+ | API framework | Native async, streaming support for token-by-token LLM responses, native Pydantic integration. Industry standard for AI backends in 2025-2026. |
| **Django** | 5.x | Full-stack framework | Only if team has strong Django expertise or needs built-in admin/auth. Otherwise FastAPI preferred for AI. |

**Decision:** FastAPI. Native async critical for LLM streaming, better integration with Python agent frameworks.

### Data Validation & Schema

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Pydantic** | 2.x | Data validation | Industry standard. Powers OpenAI SDK, Anthropic SDK, LangChain, CrewAI. 10B+ downloads. |
| **Pydantic AI** | 0.1+ | Agent framework | Use if building agents that need strict output validation. Built-in structured output validation. |

**Decision:** Pydantic v2 for all data validation. Add Pydantic AI if agent output structured validation becomes a pain point.

### Observability

| Technology | Purpose | When to Use |
|------------|---------|-------------|
| **LangSmith** | Agent tracing/debugging | Primary choice for CrewAI/LangChain agents. Excellent for debugging multi-agent flows. |
| **Pydantic Logfire** | AI observability | Newer, built by Pydantic. Good for Pydantic AI agents. |
| **OpenTelemetry** | Standard tracing | If needing vendor-neutral instrumentation. |

**Decision:** LangSmith (integrates with CrewAI natively). Add OpenTelemetry if building custom LangGraph agents.

### Infrastructure & Deployment

| Technology | Purpose | Notes |
|------------|---------|-------|
| **Docker** | Containerization | Standard for AI agent deployment. |
| **Kubernetes** | Orchestration | For scaling beyond single instance. |
| **Model Context Protocol (MCP)** | Agent-tool communication | Emerging 2025 standard. Use for connecting agents to external tools (legal databases, document stores). |
| **uv** | Package manager | CrewAI recommends uv for faster dependency management. |

**Decision:** Docker + Kubernetes (when needed). Set up MCP for tool integrations.

### Database (Relational)

| Technology | Purpose | When to Use |
|------------|---------|-------------|
| **PostgreSQL** | Primary relational DB | Standard for case data, metadata, workflow state. |
| **SQLAlchemy** | ORM | Use with FastAPI for database operations. |

**Decision:** PostgreSQL + SQLAlchemy.

## Installation

```bash
# Core AI Agent Framework
uv pip install crewai crewai-tools langchain langchain-openai

# Document Processing
uv pip install pymupdf pymupdf4llm pdfplumber pytesseract pillow

# Database
uv pip install psycopg2-binary sqlalchemy pgvector

# Backend
uv pip install fastapi uvicorn pydantic

# Vector Search (if not using pgvector)
uv pip install qdrant-client chromadb

# Observability
uv pip install langsmith

# Utilities
uv pip install python-dotenv httpx
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| CrewAI | LangGraph | Need fine-grained control over agent state, complex branching, or building custom runtime |
| CrewAI | AutoGen | Microsoft ecosystem, more enterprise features needed |
| CrewAI | Pydantic AI | Simpler agents, strict output validation priority |
| FastAPI | Django | Team expertise, need built-in admin/auth, ORM-heavy app |
| pgvector | Pinecone | No existing PostgreSQL, need fully managed |
| pgvector | Qdrant | Need better filtering performance at scale |
| pymupdf4llm | unstructured | Need more document types (HTML, emails) |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **LangChain (legacy)** | v1.0 shifted focus; older patterns deprecated | LangGraph for complex, LangChain for simple |
| **AutoGen (deprecated)** | Microsoft ended maintenance Dec 2025 | CrewAI or LangGraph |
| **ChromaDB (production)** | Not designed for production scale | pgvector, Qdrant, Pinecone |
| **Python <3.10** | CrewAI/LangGraph require 3.10+ | Upgrade Python |
| **Django REST Framework** | Overhead for AI APIs, less async-native | FastAPI |

## Stack Patterns by Variant

**If building MVP with simple sequential flows:**
- CrewAI + FastAPI + pgvector + pymupdf4llm
- Fastest path to working prototype

**If need complex branching/conditional logic:**
- LangGraph + FastAPI + pgvector
- More control, steeper learning curve

**If strict output validation is critical:**
- Pydantic AI + FastAPI + pgvector
- Legal documents require precise schema enforcement

**If using external legal databases/tools:**
- Add MCP (Model Context Protocol) for tool integrations
- Connect to legal research APIs, case management systems

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| CrewAI 0.203+ | Python 3.10-3.13 | Requires openai >=1.13.3 |
| LangGraph 1.0 | Python 3.10+ | Dropped 3.9 support |
| LangChain 1.0 | Python 3.10+ | Dropped 3.9 support |
| FastAPI 0.115+ | Python 3.9+ | Pydantic v2 required |
| Pydantic 2.x | Python 3.9+ | Breaking changes from v1 |
| PyMuPDF 1.27+ | Python 3.8+ | Current version |

## Legal AI Specific Considerations

### Document Security
- Process sensitive litigation documents on-premise or within secure cloud
- Consider data residency requirements for insurance data
- Implement audit trails for all AI-generated content

### Model Selection
- Primary: OpenAI GPT-4o / Claude 3.5/4 for reasoning
- Fallback: Smaller models for simpler tasks (extraction, classification)
- Future: Fine-tuned models for legal-specific tasks

### Compliance
- All AI outputs require human review (lawyer sign-off)
- Keep full audit trail of agent decisions
- Implement role-based access to case data

## Sources

- CrewAI Documentation (https://docs.crewai.com) — Installation, quickstart, agent/task definitions
- LangChain Blog (https://blog.langchain.com/langchain-langgraph-1dot0/) — LangChain/LangGraph 1.0 release Oct 2025
- PyMuPDF Documentation (https://pymupdf.readthedocs.io) — PDF extraction API
- Pydantic AI (https://ai.pydantic.dev) — Agent framework, 8M monthly downloads
- Vector Database Comparisons (https://firecrawl.dev/blog/best-vector-databases) — 2026 comparison guide
- FastAPI vs Django 2025 (https://capsquery.com/blog/fastapi-vs-django-in-2025) — Framework comparison

---

*Stack research for: Legal AI / Litigation Automation*
*Researched: February 26, 2026*

# Domain Pitfalls

**Domain:** Legal AI / Litigation Automation
**Researched:** 2026-02-26

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Monolithic Single Agent

**What goes wrong:** Building one LLM agent that tries to handle intake, analysis, drafting, and review all in one prompt.

**Why it happens:** Simpler to implement initially - just one agent to manage.

**Consequences:** 
- Hallucinations increase with task complexity
- Impossible to improve one area without affecting others
- No audit trail of what part of the process caused errors
- Prompt engineering becomes unwieldy

**Prevention:** Use coordinator + specialized agents from the start. Each agent has a focused prompt and can be tested/updated independently.

**Detection:** If your agent prompt is >500 words, you're probably trying to do too much.

### Pitfall 2: No Human-in-the-Loop

**What goes wrong:** Fully automated flow from claim intake to demand letter output without any human review checkpoints.

**Why it happens:** Desire to maximize automation, reduce costs.

**Consequences:**
- Legal errors with serious financial consequences
- Regulatory compliance violations
- No way to catch factual mistakes in AI-generated content
- Liability exposure if outputs are relied upon without review

**Prevention:** Implement mandatory review for all outputs, or at minimum confidence-based routing. Simple, clear-cut cases can auto-approve; complex ones go to human review.

**Detection:** If 100% of claims flow through without any human interaction, you're doing it wrong.

### Pitfall 3: Ignoring Audit Requirements

**What goes wrong:** Storing generated documents without logging what sources were used, what prompts were given, and what review occurred.

**Why it happens:** Legal industry has strict compliance requirements that feel like overhead.

**Consequences:**
- Cannot defend against claims of AI hallucination
- Regulatory penalties
- Cannot improve the system (no data on what went wrong)
- Malpractice exposure

**Prevention:** Implement comprehensive audit logging from day one. Log all prompts, all retrieved documents, all review decisions.

**Detection:** If you can't answer "what did the AI use to generate this?" for any output, you have a problem.

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 4: Premature Scaling

**What goes wrong:** Building horizontal scaling infrastructure before the basic flow works.

**Why it happens:** Excitement about handling high volume, fear of hitting limits.

**Consequences:**
- Wasted engineering time
- Architecture decisions made on wrong assumptions
- Complexity that slows down initial development

**Prevention:** Get 100 demands/month working end-to-end before optimizing. Then measure actual bottlenecks.

### Pitfall 5: No State Machine

**What goes wrong:** Case status stored ad-hoc or not at all. Just "being worked on" or "done."

**Why it happens:** Seems unnecessary for small volumes.

**Consequences:**
- Can't track where bottlenecks are
- No visibility for stakeholders
- Hard to recover from failures
- Cannot support audit requirements

**Prevention:** Implement a simple state machine from the start (intake → triage → analysis → drafting → review → complete).

### Pitfall 6: Poor Document Handling

**What goes wrong:** Not handling the variety of document formats, encoding issues, and quality variations in incoming claims.

**Why it happens:** Claim documents come from many sources, often messy.

**Consequences:**
- Intake failures
- Missing information
- Garbage in, garbage out for AI analysis

**Prevention:** Robust document preprocessing. Handle PDF, Word, images. Normalize encoding. Validate required fields.

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 7: No Template System

**What goes wrong:** Hardcoding demand letter format into prompts.

**Why it happens:** Faster to get started.

**Consequences:**
- Hard to update format
- Difficult to customize for different case types
- No separation of content from presentation

**Prevention:** Use a template engine (Handlebars, Jinja, etc.) and store templates separately from prompts.

### Pitfall 8: Ignoring Confidence Scores

**What goes wrong:** Treating all AI outputs as equal certainty.

**Why it happens:** LLMs don't naturally provide confidence.

**Consequences:**
- Over-reliance on uncertain outputs
- Can't route easy cases to auto-approve

**Prevention:** Ask the LLM for confidence scores. Use them to route to human review or auto-approve.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation | No state machine | Plan the workflow states upfront, even if not fully implemented |
| Core AI | Monolithic agent | Design agent boundaries before writing prompts |
| Production Flow | No human review | Make review part of the workflow, not optional |
| Optimization | Premature scaling | Measure actual bottlenecks first |

## Sources

- MongoDB Atlas Architecture Center - AI Agent Workflows for Insurance Claims Processing
- L-MARS: Legal Multi-Agent Workflow with Orchestrated Reasoning (arXiv 2025)
- Multi-Agent AI Architectures for Legal Process Automation (Law.co, 2025)
- Industry best practices for legal technology implementation

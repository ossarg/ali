# HEARTBEAT.md

## Checkpoint Protocol

Every heartbeat cycle, append a structured checkpoint to today's
daily log (memory/YYYY-MM-DD.md):

### Checkpoint [HH:MM]
- **Discussed:** [1-2 sentence summary of topics covered]
- **Decided:** [any decisions made, or "none"]
- **Open:** [what's still unresolved]
- **Changed:** [files updated since last checkpoint]

Rules:
- Skip the checkpoint if nothing meaningful happened since the last one.
- Never exceed 6 lines per checkpoint.
- This is the PRIMARY daily log mechanism.

## Nightly Maintenance (run after last checkpoint of the day)

1. **Demotion:** Any entry in MEMORY.md older than 14 days and not marked permanent → move to memory/archive.md
2. **Promotion:** Read last 3 daily logs. Any topic in 2+ logs but NOT in MEMORY.md → add it (1-2 lines)
3. **Cap check:** MEMORY.md must stay ≤80 lines. If over, demote oldest non-permanent entries.
4. **Bank update:** New decisions → memory/bank/decisions.md. New research → memory/bank/research.md
5. **Integrity (Sundays only):** Check for contradictions between MEMORY.md, daily logs, and bank. Write to memory/conflicts.md if found.
6. Log all maintenance actions to daily log under "## Nightly Memory Maintenance"

## Pending Reminders
(none)

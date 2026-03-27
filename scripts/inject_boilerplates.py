#!/usr/bin/env python3
"""
Inject boilerplates from filesystem into jess_prep.json.
Run after Jess-Prep (Haiku) and before Jess-Draft (Sonnet).

Haiku cannot reliably copy 35k+ chars of verbatim text. This script
reads the boilerplate files directly and embeds them in the prep JSON,
replacing whatever Haiku may have produced (truncated, summarized, or empty).

Usage:
    python3 inject_boilerplates.py <case_dir>

Example:
    python3 inject_boilerplates.py cases/servifamy/
"""
import sys
import re
import json
from pathlib import Path

BOILERPLATE_DIR = Path(__file__).resolve().parent.parent / "skills" / "drafting-answer-ar" / "references" / "boilerplates"

def extract_code_blocks(text: str) -> str:
    """Extract content from ``` code blocks in a markdown file."""
    blocks = re.findall(r'```\n(.*?)```', text, re.DOTALL)
    if blocks:
        return "\n\n".join(blocks)
    return text

def load_all_boilerplates() -> dict:
    """Load all boilerplate files from the references directory."""
    boilerplates = {}
    for f in sorted(BOILERPLATE_DIR.glob("*.md")):
        key = f.stem
        text = f.read_text(encoding='utf-8')
        boilerplates[key] = extract_code_blocks(text)
    return boilerplates

def inject(case_dir: str):
    case = Path(case_dir)
    prep_path = case / "jess_prep.json"

    if not prep_path.exists():
        print(f"ERROR: {prep_path} no existe")
        sys.exit(1)

    # Load prep JSON
    d = json.load(open(prep_path, encoding='utf-8'))

    # Load all boilerplates from filesystem
    all_bp = load_all_boilerplates()

    # Determine which boilerplates this case needs based on sections_to_include
    # For now, inject all — Draft A/B will use what they need
    d['boilerplates_inline'] = all_bp

    # Ensure split_config exists
    if 'split_config' not in d:
        d['split_config'] = {
            "draft_a_sections": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "draft_b_sections": [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
            "draft_a_target_chars": 25000,
            "draft_b_target_chars": 22000
        }

    # Ensure pipeline_blocked exists
    if 'pipeline_blocked' not in d:
        d['pipeline_blocked'] = False
        d['block_reason'] = None

    # Write back
    json.dump(d, open(prep_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

    bp_count = len(d['boilerplates_inline'])
    bp_chars = sum(len(v) for v in d['boilerplates_inline'].values())
    total_size = prep_path.stat().st_size

    print(f"Boilerplates inyectados: {bp_count} ({bp_chars:,} chars)")
    print(f"JSON total: {total_size:,} bytes")
    print(f"Pipeline blocked: {d['pipeline_blocked']}")

    if d['pipeline_blocked']:
        print(f"⚠️  BLOQUEADO: {d.get('block_reason', 'sin razón')}")
        sys.exit(2)

    print("✓ Listo para Draft A/B")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python3 inject_boilerplates.py <case_dir>")
        sys.exit(1)
    inject(sys.argv[1])

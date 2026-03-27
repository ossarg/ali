#!/usr/bin/env python3
"""
Merge jess_draft_a.txt y jess_draft_b.txt en jess_draft.txt.
Elimina señales de corte, filtra leaks, renumera secciones, valida integridad.
"""
import sys
import re
from pathlib import Path

# Roman numeral utilities
ROMAN_MAP = [
    (1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),
    (50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')
]

def to_roman(n):
    result = ''
    for value, numeral in ROMAN_MAP:
        while n >= value:
            result += numeral
            n -= value
    return result

def from_roman(s):
    s = s.upper().strip().rstrip('.')
    result = 0
    i = 0
    roman_vals = {'M':1000,'D':500,'C':100,'L':50,'X':10,'V':5,'I':1}
    while i < len(s):
        if i+1 < len(s) and roman_vals.get(s[i],0) < roman_vals.get(s[i+1],0):
            result += roman_vals[s[i+1]] - roman_vals[s[i]]
            i += 2
        else:
            result += roman_vals.get(s[i], 0)
            i += 1
    return result


def fix_numbering(text):
    """Find all Roman numeral section headings and renumber sequentially."""
    # Pattern: line starts with Roman numeral followed by . or .- and title
    # Examples: "I. OBJETO", "VIII. NEGATIVAS", "X. LA VERDAD"
    pattern = re.compile(r'^([IVXLC]+)\.\s*[-–]?\s*(.+)$', re.MULTILINE)

    matches = list(pattern.finditer(text))
    if not matches:
        return text, 0

    # Check if numbering has gaps
    numbers = [from_roman(m.group(1)) for m in matches]
    expected = list(range(1, len(numbers) + 1))

    if numbers == expected:
        return text, 0  # Already correct

    # Renumber
    fixes = 0
    # Work backwards to not shift positions
    for i, match in reversed(list(enumerate(matches))):
        new_num = to_roman(i + 1)
        old_text = match.group(0)
        new_text = f"{new_num}. {match.group(2)}"
        if old_text != new_text:
            text = text[:match.start()] + new_text + text[match.end():]
            fixes += 1

    return text, fixes


def merge(case_dir: str):
    case = Path(case_dir)
    draft_a = case / "jess_draft_a.txt"
    draft_b = case / "jess_draft_b.txt"
    output = case / "jess_draft.txt"

    if not draft_a.exists():
        print(f"ERROR: {draft_a} no existe")
        sys.exit(1)
    if not draft_b.exists():
        print(f"ERROR: {draft_b} no existe")
        sys.exit(1)

    text_a = draft_a.read_text(encoding="utf-8")
    text_b = draft_b.read_text(encoding="utf-8")

    # Eliminar señales de control
    text_a = text_a.replace("[FIN_DRAFT_A — CONTINÚA EN DRAFT_B]", "").rstrip()
    text_b = text_b.replace("[INICIO_DRAFT_B — CONTINUACIÓN DE DRAFT_A]", "").lstrip()
    text_b = text_b.replace("[FIN_DRAFT_B — DOCUMENTO COMPLETO]", "").rstrip()

    # Merge con separación limpia
    merged = text_a + "\n\n" + text_b

    # Filtrar leaks internos del pipeline
    merged = re.sub(r'\s*\(Draft [AB]\)', '', merged)
    merged = re.sub(r'Draft[ -]?[AB]', '', merged)
    merged = merged.replace('anatocistmo', 'anatocismo')

    # Fix 1: Renumerar secciones romanas si hay saltos
    merged, num_fixes = fix_numbering(merged)
    if num_fixes:
        print(f"  Numeración: {num_fixes} secciones renumeradas")

    # Validaciones básicas
    errors = []
    total_chars = len(merged)
    if total_chars < 35000:
        errors.append(f"Largo insuficiente: {total_chars} chars (mínimo 35000)")

    proveer_count = merged.lower().count("proveer de conformidad")
    if proveer_count != 1:
        errors.append(f"'Proveer de conformidad' aparece {proveer_count} veces (debe ser 1)")

    justicia_count = merged.upper().count("SERÁ JUSTICIA")
    if justicia_count != 1:
        errors.append(f"'SERÁ JUSTICIA' aparece {justicia_count} veces (debe ser 1)")

    if "CONSULTAR CON EL ASEGURADO" in merged:
        errors.append("Anti-patrón 'CONSULTAR CON EL ASEGURADO' detectado")

    if "\n---\n" in merged:
        errors.append("Separadores markdown (---) detectados")

    # Escribir resultado
    output.write_text(merged, encoding="utf-8")
    print(f"Merge completado: {output}")
    print(f"  Draft-A: {len(text_a)} chars")
    print(f"  Draft-B: {len(text_b)} chars")
    print(f"  Total:   {total_chars} chars")

    if errors:
        print("\nADVERTENCIAS:")
        for e in errors:
            print(f"  ⚠ {e}")
        sys.exit(1)
    else:
        print("\n✓ Validación OK")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python merge_drafts.py <case_dir>")
        sys.exit(1)
    merge(sys.argv[1])

#!/usr/bin/env python3
"""
Merge jess_draft_a.txt y jess_draft_b.txt en jess_draft.txt.
Elimina las señales de corte y valida integridad básica.
"""
import sys
from pathlib import Path

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

#!/usr/bin/env python3
"""
Verificación post-generación del borrador de contestación.
Ejecutar después de generar el .docx.
Retorna exit code 0 si pasa, 1 si falla checks críticos.
"""
import sys
import json
from pathlib import Path

try:
    from docx import Document
    def extract_text(path):
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
except ImportError:
    def extract_text(path):
        # fallback: leer el txt si no hay docx
        return Path(path).read_text(encoding='utf-8')

def verify(path):
    text = extract_text(path)
    total_chars = len(text)

    checks = [
        {
            "id": 1,
            "desc": "Largo mínimo (35.000 chars)",
            "pass": total_chars >= 35000,
            "value": total_chars,
            "critical": True
        },
        {
            "id": 2,
            "desc": "Sin separadores '---' visibles",
            "pass": text.count("\n---\n") == 0 and "\n---" not in text,
            "value": text.count("---"),
            "critical": True
        },
        {
            "id": 3,
            "desc": "Sin 'METADATA INTERNA'",
            "pass": "METADATA INTERNA" not in text,
            "value": text.count("METADATA INTERNA"),
            "critical": True
        },
        {
            "id": 4,
            "desc": "Sin 'Generado por:'",
            "pass": "Generado por:" not in text,
            "value": text.count("Generado por:"),
            "critical": True
        },
        {
            "id": 5,
            "desc": "Sin 'REVIEW LOU'",
            "pass": "REVIEW LOU" not in text,
            "value": text.count("REVIEW LOU"),
            "critical": True
        },
        {
            "id": 6,
            "desc": "Sin 'CONSULTAR CON EL ASEGURADO'",
            "pass": "CONSULTAR CON EL ASEGURADO" not in text,
            "value": text.count("CONSULTAR CON EL ASEGURADO"),
            "critical": True
        },
        {
            "id": 7,
            "desc": "Exactamente 1 'Proveer de conformidad'",
            "pass": text.count("Proveer de conformidad") == 1,
            "value": text.count("Proveer de conformidad"),
            "critical": False
        },
        {
            "id": 8,
            "desc": "Exactamente 1 'SERÁ JUSTICIA'",
            "pass": text.count("SERÁ JUSTICIA") == 1,
            "value": text.count("SERÁ JUSTICIA"),
            "critical": False
        },
    ]

    passed = all(c["pass"] for c in checks)
    critical_fail = any(not c["pass"] and c["critical"] for c in checks)
    warning = any(not c["pass"] and not c["critical"] for c in checks)

    if critical_fail:
        status = "DEFECTUOSO"
    elif warning:
        status = "ADVERTENCIA"
    else:
        status = "OK"

    report = {
        "file": str(path),
        "status": status,
        "chars_total": total_chars,
        "checks": [
            {
                "id": c["id"],
                "desc": c["desc"],
                "pass": c["pass"],
                "value": c["value"],
                "critical": c["critical"]
            }
            for c in checks
        ]
    }

    print(json.dumps(report, ensure_ascii=False, indent=2))

    if critical_fail:
        print("\n❌ PIPELINE DETENIDO: output defectuoso, no entregar al abogado.", file=sys.stderr)
        print("Checks fallidos:", file=sys.stderr)
        for c in checks:
            if not c["pass"]:
                print(f"  [{c['id']}] {c['desc']} — valor: {c['value']}", file=sys.stderr)
        sys.exit(1)
    elif warning:
        print("\n⚠️  ADVERTENCIA: revisar checks no críticos antes de entregar.", file=sys.stderr)
        sys.exit(0)
    else:
        print("\n✅ OK: el documento pasó todos los checks.", file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 verify_docx.py <archivo.docx|.txt>", file=sys.stderr)
        sys.exit(1)
    verify(sys.argv[1])

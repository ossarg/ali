#!/usr/bin/env python3
"""
build_contestacion.py — Genera DOCX de contestación/citación en garantía para Libra.
Uso: python3 build_contestacion.py <datos.json> <output.docx>

El JSON de entrada tiene la estructura definida en el SKILL.md de drafting-docx-ar.
"""

import json, sys, os
from datetime import datetime
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


# ─── Helpers ──────────────────────────────────────────────────────────────────

def setup_styles(doc):
    """Configura estilos base del documento."""
    style = doc.styles["Normal"]
    font = style.font
    font.name = "Arial"
    font.size = Pt(11)

    for section in doc.sections:
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.5)


def p(doc, text="", bold=False, size=11, align=None, space_before=0, space_after=6, indent=None):
    """Agrega un párrafo con formato."""
    para = doc.add_paragraph()
    if align:
        para.alignment = align
    fmt = para.paragraph_format
    fmt.space_before = Pt(space_before)
    fmt.space_after = Pt(space_after)
    if indent is not None:
        fmt.left_indent = Cm(indent)
    if text:
        run = para.add_run(text)
        run.bold = bold
        run.font.size = Pt(size)
        run.font.name = "Arial"
    return para


def section_header(doc, numeral, title, space_before=10):
    """Agrega encabezado de sección: 'I.    TÍTULO'"""
    para = doc.add_paragraph()
    para.paragraph_format.space_before = Pt(space_before)
    para.paragraph_format.space_after = Pt(4)
    run = para.add_run(f"{numeral}.\t{title}")
    run.bold = True
    run.font.size = Pt(11)
    run.font.name = "Arial"
    return para


def body_text(doc, text, space_before=0, space_after=6, indent=None):
    """Texto de cuerpo normal."""
    return p(doc, text, bold=False, size=11, space_before=space_before, space_after=space_after, indent=indent)


# ─── Secciones del escrito ────────────────────────────────────────────────────

def build_encabezado(doc, d):
    """Título + fórmula de presentación del letrado."""
    tipo = d.get("tipo_escrito", "CONTESTA DEMANDA CITADA EN GARANTÍA – OFRECE PRUEBA")
    p(doc, tipo, bold=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=10)
    p(doc, "Señor Juez:", space_after=8)

    letrado = d.get("letrado", {})
    nombre = letrado.get("nombre", "[NOMBRE DEL LETRADO — A COMPLETAR]")
    tomo = letrado.get("tomo", "[T°]")
    folio = letrado.get("folio", "[F°]")
    cuit = letrado.get("cuit", "[CUIT]")
    mail = letrado.get("mail", "[MAIL — A COMPLETAR]")
    cuit_electronico = letrado.get("cuit_electronico", cuit)

    caratula = d.get("caratula", "[CARÁTULA — A COMPLETAR]")
    expediente = d.get("expediente", "[N° EXPEDIENTE — A COMPLETAR]")

    formula = (
        f"{nombre} (T{tomo} F{folio} CPACF, CUIT {cuit}, Monotributista), "
        f"letrada apoderada, mail: {mail}, constituyendo domicilio legal en la calle "
        f"Olazabal 1515, piso 5 of. 505, CABA, y domicilio electrónico {cuit_electronico}, "
        f"en los autos caratulados: \"{caratula}\" (Expediente N° {expediente}), "
        f"a V.S. me presento y digo:"
    )
    body_text(doc, formula, space_after=8)


def build_personeria(doc, numeral="I"):
    section_header(doc, numeral, "PERSONERÍA")
    body_text(doc,
        "Que tal como surge de la copia de poder general que acompaño, que declaro bajo juramento "
        "es fiel a su original que se encuentra vigente, soy mandataria de LIBRA COMPAÑIA ARGENTINA "
        "DE SEGUROS S.A., con domicilio real en Olazábal 1515, piso 5 of. 505, de la Ciudad de Buenos Aires.")
    body_text(doc,
        "En el carácter invocado, vengo a contestar la demanda/citación en garantía que se le ha "
        "cursado a mi conferente, solicitando su total rechazo con costas.")


def build_objeto(doc, d, numeral="II"):
    section_header(doc, numeral, "OBJETO")
    fecha_notif = d.get("fecha_notificacion", "[FECHA NOTIFICACIÓN — A COMPLETAR]")
    fecha_vto = d.get("fecha_vencimiento", "[FECHA VENCIMIENTO — A COMPLETAR]")
    tipo_interv = d.get("tipo_intervencion", "citación en garantía")

    cuerpo = (
        f"Que, en el carácter invocado, vengo por el presente a contestar, en legal tiempo y forma, "
        f"la {tipo_interv} cursada en estas actuaciones, notificada por cédula el {fecha_notif}, "
        f"cuyo vencimiento opera el {fecha_vto}. "
    )
    if d.get("solicitud_rechazo", True):
        cuerpo += "Contestamos, asimismo, los términos de la demanda, cuyo rechazo pedimos expresamente, con costas."
    body_text(doc, cuerpo)


def build_poliza(doc, d, numeral="III"):
    poliza = d.get("poliza", {})
    numero = poliza.get("numero", "[N° PÓLIZA — A COMPLETAR]")
    vehiculo = poliza.get("vehiculo", "[VEHÍCULO — A COMPLETAR]")
    dominio = poliza.get("dominio", "[DOMINIO — A COMPLETAR]")
    asegurado = poliza.get("asegurado", "[ASEGURADO — A COMPLETAR]")
    vigencia_desde = poliza.get("vigencia_desde", "[DESDE — A COMPLETAR]")
    vigencia_hasta = poliza.get("vigencia_hasta", "[HASTA — A COMPLETAR]")
    limite = poliza.get("limite", "[LÍMITE — A COMPLETAR]")

    section_header(doc, numeral, "PÓLIZA")
    body_text(doc,
        f"Mi mandante emitió la póliza {numero} que amparaba -entre otros riesgos- por el de "
        f"responsabilidad civil hacia terceros, al vehículo {vehiculo} dominio {dominio}, "
        f"a nombre de {asegurado}, con una vigencia desde el {vigencia_desde} al {vigencia_hasta} "
        f"y con el límite de responsabilidad por acontecimiento establecido en las condiciones "
        f"particulares ({limite}). Adjunto a la presente copia de la póliza.")
    body_text(doc,
        "Cabe destacar que el actor carece de acción directa y autónoma contra mi representada "
        "por lo cual la responsabilidad asegurativa de mi mandante únicamente podrá hacerse efectiva "
        "en caso de condena respecto de su asegurado y en la medida del seguro (art. 118 LS).")


def build_asume_cobertura(doc, d, numeral="IV"):
    poliza = d.get("poliza", {})
    vehiculo = poliza.get("vehiculo", "[VEHÍCULO — A COMPLETAR]")
    dominio = poliza.get("dominio", "[DOMINIO — A COMPLETAR]")
    numero = poliza.get("numero", "[N° PÓLIZA — A COMPLETAR]")
    limite = poliza.get("limite", "[LÍMITE — A COMPLETAR]")

    section_header(doc, numeral, "ASUME COBERTURA – DENUNCIA LÍMITE – FORMULA RESERVA")
    body_text(doc,
        f"A la fecha de ocurrencia del hecho motivo de esta litis el vehículo {vehiculo} dominio {dominio}, "
        f"se hallaba asegurado por mi representada, bajo la póliza {numero}, por riesgo de "
        f"\"Responsabilidad Civil con límite\" (hasta {limite}), ello conforme la cláusula: "
        f"\"CG-RC 01.1 - Responsabilidad Civil - Riesgo Cubierto: El Asegurador se obliga a mantener "
        f"indemne al Asegurado y/o a la persona que con su autorización conduzca el vehículo objeto del "
        f"seguro (en adelante el Conductor), por cuanto deban a un tercero como consecuencia de daños "
        f"causados por ese vehículo o por la carga que transporte en condiciones reglamentarias, por "
        f"hechos acaecidos en el plazo convenido, en razón de la responsabilidad civil que pueda resultar "
        f"a cargo de ellos. El Asegurador asume esta obligación únicamente en favor del Asegurado y del "
        f"Conductor, hasta la suma máxima por acontecimiento, establecida en el Frente de Póliza por daños "
        f"corporales a personas, sean estas transportadas o no transportadas y por daños materiales, hasta "
        f"el monto máximo allí establecido para cada acontecimiento sin que los mismos puedan ser excedidos "
        f"por el conjunto de indemnizaciones que provengan de un mismo hecho generador…\" "
        f"En consecuencia, la eventual responsabilidad de mi mandante se encuentra estricta y taxativamente "
        f"limitada a los alcances, condiciones y montos máximos pactados contractualmente, los cuales "
        f"resultan plenamente oponibles tanto al asegurado como a los terceros reclamantes.")
    body_text(doc,
        "Asimismo, mi representada formula expresa reserva de invocar alguna de las causas de "
        "\"exclusión de cobertura\" previstas en la póliza y la Ley 17.418 con sus consecuencias jurídicas, "
        "si con posterioridad a éste responde llegaran a su conocimiento hechos, circunstancias y/o elementos "
        "no denunciados por su asegurado que hubieran obstado a esta presentación (Cláusula 3), haciendo "
        "expresa reserva de los derechos que pudieran derivarse de dicha circunstancia.")


def build_negativa_general(doc, numeral="V"):
    section_header(doc, numeral, "NEGATIVA GENERAL")
    body_text(doc,
        "Conforme lo dispone el art. 356 CPCCN, niego todos y cada uno de los hechos y el derecho "
        "invocado por la actora, como así también la autenticidad de toda la documentación que no sea "
        "expresamente reconocida en este responde.")


def build_negativas_especificas(doc, d, numeral="VI"):
    negativas = d.get("negativas_especificas", [])
    if not negativas:
        section_header(doc, numeral, "NEGATIVAS ESPECÍFICAS")
        body_text(doc, "[NEGATIVAS ESPECÍFICAS — A COMPLETAR CON LOS HECHOS DE LA DEMANDA]", indent=0.5)
        return

    section_header(doc, numeral, "NEGATIVAS ESPECÍFICAS")
    body_text(doc, "En particular, niego:")
    for item in negativas:
        if isinstance(item, dict):
            num_h = item.get("hecho_numero", "")
            hecho = item.get("hecho_original", item.get("texto", ""))
            tipo = item.get("tipo_respuesta", "niego")
        else:
            num_h = ""
            hecho = str(item)
            tipo = "niego"
        prefix = f"{num_h}. " if num_h else ""
        body_text(doc, f"{prefix}Que {hecho}", indent=0.5)


def build_excepciones(doc, d, numeral="VII"):
    excepciones = d.get("excepciones_previas", [])
    if not excepciones:
        return
    section_header(doc, numeral, "EXCEPCIONES PREVIAS")
    for exc in excepciones:
        if isinstance(exc, dict):
            tipo = exc.get("tipo", "")
            fund = exc.get("fundamento", "")
            body_text(doc, f"{tipo}: {fund}", indent=0.5)
        else:
            body_text(doc, str(exc), indent=0.5)


def build_defensas_fondo(doc, d, numeral):
    defensas = d.get("defensas_fondo", [])
    if not defensas:
        return
    section_header(doc, numeral, "DEFENSA DE FONDO")
    for df in defensas:
        if isinstance(df, dict):
            nombre = df.get("nombre", "")
            texto = df.get("texto", df.get("fundamento", ""))
            if nombre:
                para = doc.add_paragraph()
                para.paragraph_format.left_indent = Cm(0.5)
                para.paragraph_format.space_after = Pt(4)
                r1 = para.add_run(f"{nombre}. ")
                r1.bold = True
                r1.font.name = "Arial"
                r1.font.size = Pt(11)
                r2 = para.add_run(str(texto)[:600])
                r2.font.name = "Arial"
                r2.font.size = Pt(11)
            else:
                body_text(doc, str(texto)[:600], indent=0.5)
        else:
            body_text(doc, str(df)[:400], indent=0.5)


def build_prueba(doc, d, numeral):
    prueba = d.get("ofrecimiento_prueba", {})
    if not prueba:
        return
    section_header(doc, numeral, "PRUEBA")

    tipos = [
        ("documental", "A) PRUEBA DOCUMENTAL"),
        ("informativa", "B) PRUEBA INFORMATIVA"),
        ("pericial", "C) PRUEBA PERICIAL"),
        ("testimonial", "D) PRUEBA TESTIMONIAL"),
        ("confesional", "E) PRUEBA CONFESIONAL"),
    ]

    for key, label in tipos:
        items = prueba.get(key, [])
        if not items:
            continue
        para = doc.add_paragraph()
        para.paragraph_format.space_before = Pt(6)
        para.paragraph_format.space_after = Pt(3)
        r = para.add_run(label)
        r.bold = True
        r.font.size = Pt(11)
        r.font.name = "Arial"

        if isinstance(items, list):
            for item in items:
                desc = item.get("descripcion", str(item)) if isinstance(item, dict) else str(item)
                body_text(doc, f"• {desc[:300]}", indent=0.5)
        elif isinstance(items, str):
            body_text(doc, items[:500], indent=0.5)


def build_reserva_federal(doc, numeral):
    section_header(doc, numeral, "RESERVA DEL CASO FEDERAL")
    body_text(doc,
        "Para el hipotético caso de que V.S. no haga lugar a las defensas articuladas, se "
        "violarían derechos y garantías constitucionales, por lo que esta parte formula expresa "
        "reserva para ocurrir ante la Excma. Corte Suprema de Justicia de la Nación conforme "
        "el art. 14 de la ley 48.")


def build_petitorio(doc, d, numeral):
    section_header(doc, numeral, "PETITORIO")
    pet = d.get("petitorio", {})
    texto = pet.get("texto", "") if isinstance(pet, dict) else str(pet)
    if texto:
        body_text(doc, texto[:800])
    else:
        body_text(doc,
            "Por lo expuesto, solicito: a) Se me tenga por presentado, por parte y constituido el "
            "domicilio; b) Se rechace la demanda/citación en garantía con expresa imposición de costas; "
            "c) Se haga lugar a las excepciones y defensas articuladas.")

    p(doc, "\nProveer así,", space_before=12)
    p(doc, "Será Justicia.", bold=True)


def build_notas_abogado(doc, d):
    """Página separada con notas internas — no va al escrito final."""
    notas = d.get("notas_para_abogado", [])
    secciones = d.get("secciones_requieren_revision", [])
    if not notas and not secciones:
        return

    doc.add_page_break()
    p(doc, "⚠️  NOTAS PARA EL ABOGADO — NO INCLUIR EN EL ESCRITO FINAL",
      bold=True, size=11, space_after=8)

    if secciones:
        p(doc, "Secciones que requieren completamiento:", bold=True, size=10)
        for s in secciones:
            txt = s.get("seccion", str(s)) if isinstance(s, dict) else str(s)
            mot = s.get("motivo", "") if isinstance(s, dict) else ""
            p(doc, f"  • {txt}: {mot}", size=10)

    if notas:
        p(doc, "\nOtras notas:", bold=True, size=10)
        for n in notas:
            txt = n.get("nota", str(n)) if isinstance(n, dict) else str(n)
            p(doc, f"  • {txt}", size=10)


# ─── Builder principal ────────────────────────────────────────────────────────

def build_contestacion(data: dict, output_path: str):
    doc = Document()
    setup_styles(doc)

    tipo = data.get("tipo_intervencion", "citacion_garantia")
    tiene_poliza = bool(data.get("poliza", {}).get("numero"))

    # Encabezado
    build_encabezado(doc, data)

    n = 1
    # I. Personería
    build_personeria(doc, to_roman(n)); n += 1

    # II. Objeto
    build_objeto(doc, data, to_roman(n)); n += 1

    # III. Póliza (si hay número) o placeholder
    build_poliza(doc, data, to_roman(n)); n += 1

    # IV. Asume Cobertura
    build_asume_cobertura(doc, data, to_roman(n)); n += 1

    # V. Negativa General
    build_negativa_general(doc, to_roman(n)); n += 1

    # VI. Negativas Específicas
    build_negativas_especificas(doc, data, to_roman(n)); n += 1

    # VII. Excepciones previas (si hay)
    excepciones = data.get("excepciones_previas", [])
    if excepciones:
        build_excepciones(doc, data, to_roman(n)); n += 1

    # Defensas de fondo (si hay)
    defensas = data.get("defensas_fondo", [])
    if defensas:
        build_defensas_fondo(doc, data, to_roman(n)); n += 1

    # Prueba
    build_prueba(doc, data, to_roman(n)); n += 1

    # Reserva Caso Federal
    build_reserva_federal(doc, to_roman(n)); n += 1

    # Petitorio
    build_petitorio(doc, data, to_roman(n)); n += 1

    # Notas internas (página separada)
    build_notas_abogado(doc, data)

    doc.save(output_path)
    print(f"DOCX generado: {output_path}")


def to_roman(n):
    vals = [(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]
    result = ""
    for val, sym in vals:
        while n >= val:
            result += sym
            n -= val
    return result


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python3 build_contestacion.py <datos.json> <output.docx>")
        sys.exit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.load(f)
    build_contestacion(data, sys.argv[2])

"""Génère les illustrations au trait (SVG inline) du portfolio.
Projection oblique alignée sur l'angle du logo L (~42°). Lancer : python3 tools/illustrations.py"""
import math, json

K = 0.6
PX, PY = math.cos(math.radians(42)) * K, -math.sin(math.radians(42)) * K
f = lambda v: f"{v:.1f}".rstrip('0').rstrip('.')

def pts(*ps): return " ".join(f"{f(x)},{f(y)}" for x, y in ps)
def poly(ps, cls="draw", extra=""): return f'<polygon class="{cls}" pathLength="1" points="{pts(*ps)}"{extra}/>'
def line(a, b, cls="draw", extra=""): return f'<line class="{cls}" pathLength="1" x1="{f(a[0])}" y1="{f(a[1])}" x2="{f(b[0])}" y2="{f(b[1])}"{extra}/>'

def box(x0, y0, W, D, t):
    """Pavé oblique : renvoie (svg, fonction de placement sur la face du dessus)."""
    A = (x0, y0); B = (x0 + W, y0); C = (B[0] + PX * D, B[1] + PY * D); Dd = (A[0] + PX * D, A[1] + PY * D)
    face = lambda u, v: (x0 + u + v * PX, y0 + v * PY)
    s = poly([A, B, C, Dd], "draw face")
    s += poly([A, B, (B[0], B[1] + t), (A[0], A[1] + t)], "draw face")
    s += poly([B, C, (C[0], C[1] + t), (B[0], B[1] + t)], "draw face")
    return s, face

# ---------- 1. À propos : l'ordinateur (code) et le carnet (design) ----------
def desk():
    out = []
    # Écran de l'ordinateur, debout sur le bord arrière du clavier
    x0, y0, W, D, t, H = 40, 330, 250, 150, 7, 180
    fc = lambda u, v: (x0 + u + v * PX, y0 + v * PY)
    sp = lambda u, h: (fc(u, D)[0], fc(u, D)[1] - h)
    out.append(poly([sp(0, 0), sp(W, 0), sp(W, H), sp(0, H)], "draw face"))
    out.append(poly([sp(12, 12), sp(W - 12, 12), sp(W - 12, H - 12), sp(12, H - 12)], "draw soft"))
    code = [(0, 120), (1, 90), (2, 130), (2, 70), (1, 40), (0, 30), (0, 110), (1, 150), (0, 20)]
    for n, (ind, ln) in enumerate(code):
        h = H - 34 - n * 15
        cls = "draw accent" if n == 3 else "draw soft"
        out.append(line(sp(28 + ind * 16, h), sp(28 + ind * 16 + ln * .8, h), cls))
    # Clavier
    s_, _ = box(x0, y0, W, D, t); out.append(s_)
    out.append(poly([fc(18, 62), fc(W - 18, 62), fc(W - 18, 134), fc(18, 134)], "draw soft"))
    for v in (80, 98, 116):
        out.append(line(fc(18, v), fc(W - 18, v), "draw soft"))
    out.append(poly([fc(92, 14), fc(158, 14), fc(158, 46), fc(92, 46)], "draw soft"))
    # Carnet de croquis ouvert
    nx, ny, NW, ND = 236, 452, 210, 160
    s_, fn = box(nx, ny, NW, ND, 4); out.append(s_)
    out.append(line(fn(NW / 2, 0), fn(NW / 2, ND), "draw soft"))
    out.append(poly([fn(16, 84), fn(90, 84), fn(90, 140), fn(16, 140)], "draw"))
    out.append(line(fn(16, 84), fn(90, 140), "draw soft"))
    out.append(line(fn(16, 140), fn(90, 84), "draw soft"))
    out.append(line(fn(16, 64), fn(80, 64), "draw soft"))
    out.append(line(fn(16, 48), fn(62, 48), "draw soft"))
    out.append(poly([fn(16, 16), fn(52, 16), fn(52, 28), fn(16, 28)], "draw soft"))
    c = fn(150, 98)
    out.append(f'<circle class="draw soft" pathLength="1" cx="{f(c[0])}" cy="{f(c[1])}" r="15"/>')
    out.append(line(fn(124, 70), fn(186, 70), "draw soft"))
    out.append(line(fn(124, 56), fn(170, 56), "draw soft"))
    # Crayon posé sur la page de droite
    a, b = (122, 14), (200, 44)
    dx, dy = b[0] - a[0], b[1] - a[1]; L_ = math.hypot(dx, dy); nx_, ny_ = -dy / L_ * 3.5, dx / L_ * 3.5
    out.append(poly([fn(a[0] + nx_, a[1] + ny_), fn(b[0] + nx_, b[1] + ny_), fn(b[0] - nx_, b[1] - ny_), fn(a[0] - nx_, a[1] - ny_)], "draw face"))
    tip = (a[0] - dx / L_ * 12, a[1] - dy / L_ * 12)
    out.append(poly([fn(a[0] + nx_, a[1] + ny_), fn(*tip), fn(a[0] - nx_, a[1] - ny_)], "draw face"))
    # Étiquettes
    yl = sp(W, H)[1] + 40; xl = sp(W, 0)[0]
    out.append(line((xl + 8, yl), (xl + 44, yl), "draw soft"))
    out.append(f'<text x="{f(xl + 54)}" y="{f(yl + 4)}" data-i18n="ill.code">Code</text>')
    yd = fn(NW, ND / 2)[1]; xd = fn(NW, ND / 2)[0]
    out.append(line((xd + 10, yd), (xd + 40, yd), "draw soft"))
    out.append(f'<text x="{f(xd + 50)}" y="{f(yd + 4)}" data-i18n="ill.design">Design</text>')
    return f'<svg class="ill ill--desk" viewBox="0 70 640 400" role="img" aria-labelledby="ill-desk-t"><title id="ill-desk-t" data-i18n="ill.deskT">Illustration : un ordinateur ouvert sur du code, à côté d\'un carnet de croquis</title>{"".join(out)}</svg>'

# ---------- 2. Parcours : des marches qui montent ----------
def stairs():
    out = []; W, D, x0, base = 64, 70, 10, 330
    for i in range(6):
        h = 34 + i * 34
        x = x0 + i * (W + 6)
        y = base - h
        A = (x, y); B = (x + W, y); C = (B[0] + PX * D, B[1] + PY * D); Dd = (A[0] + PX * D, A[1] + PY * D)
        cls = "draw face" + (" accent" if i == 5 else "")
        out.append(poly([A, B, C, Dd], cls))
        out.append(poly([A, B, (B[0], base), (A[0], base)], cls))
        out.append(poly([B, C, (C[0], base + PY * D), (B[0], base)], cls))
    out.append(line((0, base), (x0 + 6 * (W + 6) + PX * D + 10, base), "draw soft"))
    return f'<svg class="ill ill--stairs" viewBox="0 70 470 270" aria-hidden="true">{"".join(out)}</svg>'

# ---------- 3. Pictos savoir-faire ----------
ICONS = {
    "dev": '<polygon class="draw" pathLength="1" points="10,38 18,10 46,10 38,38"/><polyline class="draw accent" pathLength="1" points="24,18 18,24 24,30"/><polyline class="draw" pathLength="1" points="32,18 38,24 32,30"/>',
    "design": '<rect class="draw" pathLength="1" x="8" y="16" width="22" height="22"/><circle class="draw accent" pathLength="1" cx="32" cy="18" r="11"/><line class="draw" pathLength="1" x1="8" y1="38" x2="44" y2="6"/>',
    "ops": '<circle class="draw" pathLength="1" cx="26" cy="24" r="16"/><ellipse class="draw" pathLength="1" cx="26" cy="24" rx="7" ry="16"/><line class="draw" pathLength="1" x1="10" y1="24" x2="42" y2="24"/><circle class="draw accent" pathLength="1" cx="40" cy="10" r="3"/>',
    "soft": '<circle class="draw" pathLength="1" cx="19" cy="24" r="12"/><circle class="draw accent" pathLength="1" cx="33" cy="24" r="12"/>',
}
def icon(k): return f'<svg class="ill ill--icon" viewBox="0 0 52 48" aria-hidden="true">{ICONS[k]}</svg>'

# ---------- 4. Contact : construction du logo ----------
def blueprint():
    P = [[(0, 67), (35, 35.3), (35, 253.3), (0, 285)], [(37, 33.5), (74, 0), (74, 218), (37, 251.5)],
         [(89, 220), (245, 220), (199, 264), (43, 264)], [(41, 266), (197, 266), (159, 302), (3, 302)]]
    s, ox, oy = 1.25, 70, 40
    tr = lambda p: (ox + p[0] * s, oy + p[1] * s)
    out = []
    for x in (0, 37, 74, 245):
        out.append(line(tr((x, -30)), tr((x, 330)), "draw guide"))
    for y in (0, 220, 266, 302):
        out.append(line(tr((-40, y)), tr((290, y)), "draw guide"))
    out.append(line(tr((-30, 330)), tr((300, 30)), "draw guide"))
    out.append(f'<circle class="draw guide" pathLength="1" cx="{f(tr((74, 218))[0])}" cy="{f(tr((74, 218))[1])}" r="{f(118 * s)}"/>')
    for p in P: out.append(poly([tr(q) for q in p], "draw"))
    cx, cy = tr((81, 236))
    out.append(f'<circle class="draw accent" pathLength="1" cx="{f(cx)}" cy="{f(cy)}" r="5"/>')
    return f'<svg class="ill ill--blueprint" viewBox="0 0 470 480" aria-hidden="true">{"".join(out)}</svg>'

# ---------- 5. Projets design : wireframes ----------
def wire_app():
    o = ['<rect class="draw" pathLength="1" x="110" y="40" width="180" height="340" rx="22"/>',
         '<line class="draw soft" pathLength="1" x1="180" y1="56" x2="220" y2="56"/>',
         '<rect class="draw soft" pathLength="1" x="128" y="80" width="144" height="96" rx="6"/>',
         '<line class="draw soft" pathLength="1" x1="128" y1="80" x2="272" y2="176"/>', '<line class="draw soft" pathLength="1" x1="272" y1="80" x2="128" y2="176"/>',
         '<line class="draw" pathLength="1" x1="128" y1="204" x2="236" y2="204"/>', '<line class="draw soft" pathLength="1" x1="128" y1="224" x2="262" y2="224"/>',
         '<line class="draw soft" pathLength="1" x1="128" y1="240" x2="214" y2="240"/>',
         '<rect class="draw soft" pathLength="1" x="128" y="264" width="66" height="54" rx="6"/>', '<rect class="draw soft" pathLength="1" x="206" y="264" width="66" height="54" rx="6"/>',
         '<rect class="draw accent" pathLength="1" x="128" y="336" width="144" height="26" rx="13"/>']
    return f'<svg class="ill ill--wire" viewBox="0 0 400 420" aria-hidden="true">{"".join(o)}</svg>'

def wire_identity():
    o = []
    for i in range(1, 8):
        o.append(f'<line class="draw guide" pathLength="1" x1="{50 * i}" y1="20" x2="{50 * i}" y2="400"/>')
        o.append(f'<line class="draw guide" pathLength="1" x1="20" y1="{20 + 50 * i - 25}" x2="380" y2="{20 + 50 * i - 25}"/>')
    o.append('<circle class="draw soft" pathLength="1" cx="200" cy="210" r="130"/>')
    P = [[(0, 67), (35, 35.3), (35, 253.3), (0, 285)], [(37, 33.5), (74, 0), (74, 218), (37, 251.5)],
         [(89, 220), (245, 220), (199, 264), (43, 264)], [(41, 266), (197, 266), (159, 302), (3, 302)]]
    s, ox, oy = .62, 124, 116
    for p in P: o.append(poly([(ox + x * s, oy + y * s) for x, y in p], "draw"))
    o.append('<circle class="draw accent" pathLength="1" cx="200" cy="210" r="4"/>')
    return f'<svg class="ill ill--wire" viewBox="0 0 400 420" aria-hidden="true">{"".join(o)}</svg>'

out = {"desk": desk(), "stairs": stairs(), "blueprint": blueprint(), "wire_app": wire_app(), "wire_identity": wire_identity(),
       **{f"icon_{k}": icon(k) for k in ICONS}}
json.dump(out, open(__file__.replace(".py", ".json"), "w"), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()})

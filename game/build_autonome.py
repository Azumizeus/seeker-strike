# -*- coding: utf-8 -*-
"""
Genere seeker-strike-MOBILE.html : version AUTONOME, un seul fichier.

Pourquoi deux versions :
  - en local (file://), les navigateurs Android refusent de lire les fichiers
    voisins du HTML -> les sprites et les musiques externes ne chargent jamais
    et le jeu retombe sur ses formes geometriques ;
  - servi en HTTPS, la version externalisee demarre bien plus vite car les
    images se chargent en parallele au lieu d'etre decodees au demarrage.

index_v37.html reste la version de travail, externalisee.
"""
import io, os, re, base64, sys

SRC   = "index_v37.html"
DST   = "seeker-strike-MOBILE.html"
AUDIO = "assets/audio_leger"        # pistes courtes embarquees dans le build

def preparer_audio_leger():
    """Genere les pistes allegees si elles manquent.
    Le build ne doit dependre d'aucun dossier temporaire : /tmp est efface
    entre les sessions et le build echouait silencieusement."""
    import subprocess
    src_dir = "assets/audio"
    if not os.path.isdir(src_dir):
        sys.exit("dossier %s introuvable" % src_dir)
    os.makedirs(AUDIO, exist_ok=True)
    for f in sorted(os.listdir(src_dir)):
        if not f.endswith(".mp3"):
            continue
        dst = os.path.join(AUDIO, f)
        if os.path.exists(dst) and os.path.getsize(dst) > 1000:
            continue
        duree = 30 if f in ("victory_theme.mp3", "defeat_theme.mp3") else 45
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-t", str(duree),
                        "-i", os.path.join(src_dir, f),
                        "-af", "afade=t=out:st=%d:d=2" % (duree - 2),
                        "-ac", "2", "-ar", "44100", "-b:a", "64k",
                        "-write_xing", "1", dst], check=True)
        print("  piste allegee generee : %s" % f)

SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8":            "image/jpeg",
}

def data_uri(chemin):
    """Encode un fichier en data URI, en verifiant qu'il est reellement
    exploitable. Un fichier vide ou tronque produisait jusqu'ici une entree
    silencieusement invalide : le sprite tombait sur sa forme geometrique
    de secours sans qu'aucune erreur ne remonte au build."""
    donnees = open(chemin, "rb").read()
    if len(donnees) < 64:
        sys.exit("FICHIER VIDE OU TRONQUE : %s (%d octets)" % (chemin, len(donnees)))

    ext = chemin.rsplit(".", 1)[1].lower()
    attendu = {"png":"image/png", "jpg":"image/jpeg", "jpeg":"image/jpeg",
               "webp":"image/webp", "mp3":"audio/mpeg"}[ext]

    # le contenu doit correspondre a l'extension
    if ext in ("png","jpg","jpeg"):
        reel = next((m for sig,m in SIGNATURES.items() if donnees.startswith(sig)), None)
        if reel != attendu:
            sys.exit("FORMAT INCOHERENT : %s annonce %s mais contient %s" % (chemin, attendu, reel))
    elif ext == "webp":
        if donnees[:4] != b"RIFF" or donnees[8:12] != b"WEBP":
            sys.exit("WEBP INVALIDE : %s" % chemin)
    elif ext == "mp3":
        if not (donnees[:3] == b"ID3" or donnees[:2] == b"\xff\xfb" or donnees[:2] == b"\xff\xf3"):
            sys.exit("MP3 INVALIDE : %s" % chemin)

    return "data:%s;base64,%s" % (attendu, base64.b64encode(donnees).decode())

preparer_audio_leger()

# Controle prealable : aucun asset ne doit etre vide
vides = []
for dossier in ("assets/inline", "assets/audio"):
    if os.path.isdir(dossier):
        for f in sorted(os.listdir(dossier)):
            p = os.path.join(dossier, f)
            if os.path.isfile(p) and os.path.getsize(p) < 64:
                vides.append("%s (%d octets)" % (p, os.path.getsize(p)))
if vides:
    sys.exit("ASSETS VIDES, build interrompu :\n  " + "\n  ".join(vides))
print("  controle des assets : aucun fichier vide")

s = io.open(SRC, encoding="utf-8").read()
depart = len(s)

# ---------- 1. images externes -> ASSETS_INLINE ----------
m = re.search(r"const ASSETS_FICHIERS = \[(.*?)\n\];", s, re.S)
entrees = re.findall(r"\['([A-Za-z0-9_]+)','([^']+)'\]", m.group(1))
absents = [c for c,p in entrees if not os.path.exists(p)]
if absents:
    sys.exit("images introuvables : %s" % absents[:5])

# Assert de couverture : aucune image ne doit rester en chemin de fichier
# ailleurs que dans ASSETS_FICHIERS. C'est exactement la faute qui avait laisse
# 7 icones absentes du build autonome (declarees dans ASSETS_INLINE).
mi = re.search(r"const ASSETS_INLINE = \[(.*?)\n\];", s, re.S)
if mi:
    egarees = re.findall(r"\['([A-Za-z0-9_]+)','(assets/[^']+)'\]", mi.group(1))
    if egarees:
        sys.exit("ASSETS MAL PLACES : %d entree(s) pointent un fichier depuis "
                 "ASSETS_INLINE, elles ne seront pas embarquees :\n  %s\n"
                 "Deplace-les dans ASSETS_FICHIERS." %
                 (len(egarees), "\n  ".join("%s -> %s" % e for e in egarees)))
print("  couverture des assets : aucune entree egaree dans ASSETS_INLINE")

lignes = ",\n  ".join("['%s','%s']" % (cle, data_uri(chemin)) for cle,chemin in entrees)
s = s[:m.start()] + "const ASSETS_FICHIERS = [];" + s[m.end():]
s = s.replace("const ASSETS_INLINE = [",
              "const ASSETS_INLINE = [\n  " + lignes + ",", 1)
print("  images reintegrees : %d" % len(entrees))

# ---------- 2. cartes ----------
def carte(mm):
    return "%s:{nom:'%s', img:'%s'}" % (mm.group(1), mm.group(2), data_uri(mm.group(3)))
s, k = re.subn(r"(\d):\{nom:'([^']*)', img:'(assets/[^']+)'\}", carte, s)
print("  cartes reintegrees : %d" % k)

# ---------- 3. musiques ----------
pistes = {}
for f in sorted(os.listdir(AUDIO)):
    if f.endswith(".mp3"):
        pistes[f[:-4]] = data_uri(os.path.join(AUDIO,f))
bloc = ",\n  ".join("%s:'%s'" % (n,u) for n,u in pistes.items())
s = s.replace("const MUSIQUES_INLINE = {};",
              "const MUSIQUES_INLINE = {\n  " + bloc + "\n};", 1)
print("  musiques reintegrees : %d" % len(pistes))

# ---------- 4. reperage de la version ----------
s = s.replace("Genesis Protocol v4.2 &bull; <span style=\"color:#fbbf24\">devnet</span>",
              "Genesis Protocol v4.2 &bull; autonome &bull; <span style=\"color:#fbbf24\">devnet</span>")

io.open(DST,"w",encoding="utf-8").write(s)
print("\n%s : %.2f Mo  (source externalisee : %.2f Mo)" %
      (DST, os.path.getsize(DST)/1048576, depart/1048576))

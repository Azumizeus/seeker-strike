# -*- coding: utf-8 -*-
"""Régénère audit/ depuis game/index_v37.html.

Le dossier audit/ est une copie découpée et allégée du jeu, destinée à être
relue par un humain ou un assistant qui ne peut pas avaler 2,87 Mo d'un coup.
Les images base64 sont retirées : elles ne concernent aucun audit.

À RELANCER APRÈS CHAQUE MODIFICATION DE LA SOURCE. Un audit/ périmé est pire
que pas d'audit du tout : il fait travailler sur du code qui n'existe plus.
Cas vécu : un rapport complet rendu sur la v4.2 alors que la source était en
v4.3, avec des bugs signalés qui étaient déjà corrigés.

Usage :  cd game && python3 build_audit.py
"""
import io, os, re, sys

SRC = 'index_v37.html'
DST = '../audit'

if not os.path.exists(SRC):
    sys.exit('index_v37.html introuvable — lance ce script depuis game/')

brut = io.open(SRC, encoding='utf-8').read()

# Version affichée dans les en-têtes, lue dans le titre du jeu.
m = re.search(r'Genesis Protocol v([0-9.]+)', brut)
VERSION = m.group(1) if m else '?'

deb = brut.rfind('<script>') + 8
fin = brut.rfind('</script>')
script = brut[deb:fin]
html = brut[:deb - 8]


def alleger(t):
    """Remplace les data URI par un marqueur : ils pèsent sans rien apprendre."""
    t = re.sub(r"data:image/[a-z+]+;base64,[A-Za-z0-9+/=]{40,}",
               "data:image/…;base64,<retiré>", t)
    t = re.sub(r"data:audio/[a-z]+;base64,[A-Za-z0-9+/=]{40,}",
               "data:audio/…;base64,<retiré>", t)
    return t


def entete(nom, titre, note):
    return ("/* " + "=" * 60 + "\n"
            "   SEEKER STRIKE v%s - %s\n"
            "   %s\n"
            "   %s\n"
            "   Genere par game/build_audit.py — NE PAS EDITER A LA MAIN.\n"
            "   La source de verite est game/index_v37.html.\n"
            "   " + "=" * 60 + " */\n") % (VERSION, nom, titre, note)


# Bornes de découpe : ancres textuelles plutôt que numéros de ligne, pour que
# le découpage survive à l'ajout ou au retrait de code.
ANCRES = [
    ('2-donnees.js',      'Constantes, etat, donnees de jeu',
     None,
     '   SEEKER TASK — vraies transactions on-chain (devnet)'),
    ('3-solana.js',       'Integration Solana : wallet, signatures, RPC, paliers',
     '   SEEKER TASK — vraies transactions on-chain (devnet)',
     'function initGame'),
    ('4-moteur.js',       'Moteur de jeu : boucle, rendu, ennemis, boss',
     'function initGame',
     'const EN ='),
    ('5-traductions.js',  'Table de traduction FR vers EN',
     'const EN =',
     'function T(fr'),
    ('6-outils.js',       'Traduction, ecrans, reglages, easter eggs',
     'function T(fr',
     None),
]

if not os.path.isdir(DST):
    os.makedirs(DST)

# 1-interface.html : la structure de la page, sans le script.
io.open(os.path.join(DST, '1-interface.html'), 'w', encoding='utf-8').write(
    "<!-- SEEKER STRIKE v%s - 1-interface.html\n"
    "     Structure HTML et CSS, hors script. Images base64 retirees.\n"
    "     Genere par game/build_audit.py — NE PAS EDITER A LA MAIN. -->\n%s"
    % (VERSION, alleger(html)))

produits = [('1-interface.html', html.count('\n') + 1)]

for nom, titre, debut, arret in ANCRES:
    i = 0 if debut is None else script.find(debut)
    j = len(script) if arret is None else script.find(arret)
    if i < 0 or j < 0 or j <= i:
        sys.exit('DECOUPE IMPOSSIBLE pour %s : ancre introuvable '
                 '(debut=%s arret=%s). Les ancres ont bouge, corrige ANCRES.'
                 % (nom, i, j))
    bloc = alleger(script[i:j])
    lignes = script[:i].count('\n') + 1, script[:j].count('\n') + 1
    note = 'Lignes %d a %d du script (game/index_v37.html)' % lignes
    io.open(os.path.join(DST, nom), 'w', encoding='utf-8').write(
        entete(nom, titre, note) + bloc)
    produits.append((nom, bloc.count('\n') + 1))

# LISEZ-MOI régénéré : il porte la version, donc l'obsolescence se voit.
lignes_md = "\n".join("| `%s` | %d | %.0f Ko |" %
                      (n, l, os.path.getsize(os.path.join(DST, n)) / 1024)
                      for n, l in produits)
io.open(os.path.join(DST, 'LISEZ-MOI.md'), 'w', encoding='utf-8').write(
    """# Copie d'audit — Seeker Strike v%s

Copie **générée** de `game/index_v37.html`, découpée en six fichiers lisibles.
Les images et sons en base64 sont remplacés par `<retiré>`.

| Fichier | Lignes | Poids |
|---|---|---|
%s

## À lire selon le sujet

| Sujet | Fichier |
|---|---|
| Signatures, clés, transferts, RPC | `3-solana.js` — **suffit pour un audit sécurité** |
| Équilibrage, ennemis, boss | `4-moteur.js` |
| Économie, prix, paliers | `2-donnees.js` |
| Couverture FR/EN | `5-traductions.js` |
| Réglages, easter eggs | `6-outils.js` |
| Structure de page, CSS | `1-interface.html` |

## Deux règles

1. **Ces fichiers ne s'exécutent pas.** Ce sont des extraits pour la lecture.
2. **Ne jamais les éditer.** La source unique est `game/index_v37.html` ;
   toute correction s'y fait, puis `cd game && python3 build_audit.py`.

Si la version en tête de fichier ne correspond pas à celle du jeu, ce dossier
est périmé : régénérez-le avant d'auditer quoi que ce soit.
""" % (VERSION, lignes_md))

total = sum(os.path.getsize(os.path.join(DST, n)) for n, _ in produits)
print('audit/ regenere en v%s — %d fichiers, %.0f Ko'
      % (VERSION, len(produits) + 1, total / 1024))
for n, l in produits:
    print('   %-20s %5d lignes' % (n, l))

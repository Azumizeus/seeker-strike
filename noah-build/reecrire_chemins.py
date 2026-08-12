# -*- coding: utf-8 -*-
"""Réécrit les chemins d'assets de index.html pour le déploiement Noah.

À lancer depuis noah-build/ après avoir copié game/index_v37.html.
Attendu : 102 réécritures, 0 chemin restant. Si le compte diffère, ne pas
déployer : une interruption de ce script a déjà laissé 101 images cassées.
"""
import io, re, os, sys

F = 'index.html'
if not os.path.exists(F):
    sys.exit('index.html introuvable — lance ce script depuis noah-build/')

s = io.open(F, encoding='utf-8').read()

# Les images et l'audio vivent sous public/ une fois déployés.
s, k = re.subn(r"'assets/(inline|audio)/", r"'public/assets/\1/", s)
# Deux références échappent à la regex : l'icône Apple et la base audio.
s = s.replace('"assets/inline/icone180.png"', '"public/assets/inline/icone180.png"')
s = s.replace("base:'assets/audio/'", "base:'public/assets/audio/'")

io.open(F, 'w', encoding='utf-8').write(s)

restants = s.count("'assets/inline/") + s.count("'assets/audio/")
print('chemins réécrits : %d | restants : %d | %.2f Mo'
      % (k, restants, os.path.getsize(F) / 1048576))

if restants:
    sys.exit('COMPTE INATTENDU : %d chemins non réécrits — ne pas déployer' % restants)
if k == 0:
    print('OK — fichier déjà réécrit, rien à faire')
elif k != 102:
    sys.exit('COMPTE INATTENDU : %d réécritures au lieu de 102 — vérifie' % k)
else:
    print('OK')

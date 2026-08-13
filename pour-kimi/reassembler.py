# -*- coding: utf-8 -*-
"""Recolle les morceaux en index.html.  python3 reassembler.py"""
import io, glob
parts = sorted(glob.glob('partie-*.txt'))
if not parts: raise SystemExit('aucun morceau trouve')
html = ''.join(io.open(p, encoding='utf-8').read() for p in parts)
io.open('index.html', 'w', encoding='utf-8').write(html)
print('index.html reconstitue : %.2f Mo depuis %d morceaux' % (len(html)/1048576, len(parts)))
assert html.startswith('<!DOCTYPE html>'), 'debut inattendu'
assert html.rstrip().endswith('</html>'), 'fin inattendue'
print('OK')

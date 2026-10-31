#!/usr/bin/env python3
# Aggiorna data e ora di «Ultima modifica» (ora italiana) in cima alle pagine del sito.
# Va eseguito prima di ogni pubblicazione: python3 tools/aggiorna-data.py
import re, datetime, os
from zoneinfo import ZoneInfo
M = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre']
n = datetime.datetime.now(ZoneInfo('Europe/Rome'))
txt = '%d %s %d, ore %02d:%02d' % (n.day, M[n.month-1], n.year, n.hour, n.minute)
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
for p in ['index.html', 'impara/index.html']:
    f = os.path.join(root, p)
    s = open(f, encoding='utf8').read()
    t = re.sub(r'(<span data-stamp>)[^<]*(</span>)', lambda m: m.group(1) + txt + m.group(2), s)
    if t != s: open(f, 'w', encoding='utf8').write(t)
print('Ultima modifica:', txt)

#!/usr/bin/env python3
# Aggiorna la versione del sito, scritta in piccolo a destra nel piè di pagina.
# Formato: ggmmaahhmm + v + versione (es. 11 marzo 2027 ore 12:20, versione 1.2.6 -> 1103271220v1.2.6).
# Va eseguito una volta prima di ogni pubblicazione: python3 tools/aggiorna-data.py
#   senza opzioni: aumenta l'ultima cifra (1.2.5 -> 1.2.6)
#   --funzione:    funzione nuova, aumenta la cifra di mezzo (1.2.6 -> 1.3.0)
#   --versione X.Y.Z: imposta un numero preciso (es. 1.0.0 per il passaggio a Serverplan)
#   --stessa:      riscrive data e ora senza cambiare il numero
import re, sys, datetime, os
from zoneinfo import ZoneInfo
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
vf = os.path.join(root, 'tools', 'versione.txt')
a = sys.argv[1:]
if os.path.exists(vf):
    x, y, z = [int(n) for n in open(vf).read().strip().split('.')]
    if '--versione' in a: x, y, z = [int(n) for n in a[a.index('--versione') + 1].split('.')]
    elif '--funzione' in a: y, z = y + 1, 0
    elif '--stessa' not in a: z += 1
else:
    x, y, z = 0, 9, 0
    if '--versione' in a: x, y, z = [int(n) for n in a[a.index('--versione') + 1].split('.')]
ver = '%d.%d.%d' % (x, y, z)
open(vf, 'w').write(ver + '\n')
n = datetime.datetime.now(ZoneInfo('Europe/Rome'))
txt = n.strftime('%d%m%y%H%M') + 'v' + ver
for p in ['index.html', 'impara/index.html']:
    f = os.path.join(root, p)
    s = open(f, encoding='utf8').read()
    t = re.sub(r'(<span data-stamp>)[^<]*(</span>)', lambda m: m.group(1) + txt + m.group(2), s)
    if t != s: open(f, 'w', encoding='utf8').write(t)
print('Versione:', txt)

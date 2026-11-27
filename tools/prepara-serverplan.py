#!/usr/bin/env python3
"""Prepara la copia del sito per Serverplan (dominio micologicainzenga.it) nella cartella dist/.

Uso:  python3 tools/prepara-serverplan.py            -> copia di prova: resta noindex e con la password di anteprima
      python3 tools/prepara-serverplan.py --online   -> messa online vera: toglie noindex, scrive robots.txt aperto
Non pubblica niente: crea solo dist/, da caricare via SFTP o dal pannello di Serverplan.
"""
import os, re, shutil, sys, datetime

DOMINIO = 'https://micologicainzenga.it/'
VECCHIO = 'https://cangelosky.github.io/Inzenga/'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST = os.path.join(ROOT, 'dist')
ONLINE = '--online' in sys.argv

# cosa va sul server (la v1 del gestionale, i provini e gli strumenti restano fuori)
INCLUDI = ['index.html', 'area-soci.js', 'sw.js', 'manifest.webmanifest', 'img', 'impara', 'gestionale-v2']
TESTO = ('.html', '.js', '.webmanifest', '.json', '.css', '.svg', '.txt', '.xml')

HTACCESS = r"""# Sito dell'Associazione Micologica Giuseppe Inzenga APS (Serverplan, Apache)
Options -Indexes
DirectoryIndex index.html

# solo https e senza www
RewriteEngine On
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://micologicainzenga.it%{REQUEST_URI} [L,R=301]

<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  Header always set X-Frame-Options "SAMEORIGIN"
  # il gestionale non deve mai finire nei motori di ricerca né in cache condivise
  <If "%{REQUEST_URI} =~ m#^/gestionale-v2/#">
    Header always set X-Robots-Tag "noindex, nofollow"
    Header always set Cache-Control "no-store"
  </If>
</IfModule>

# cache: pagine sempre fresche, immagini a lungo
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType application/javascript "access plus 1 hour"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
  ExpiresByType application/pdf "access plus 30 days"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml application/manifest+json
</IfModule>
AddType application/manifest+json .webmanifest
AddType image/webp .webp

# file che non devono essere letti dall'esterno
<FilesMatch "(^\.|\.(py|md|sh|bak|log)$)">
  Require all denied
</FilesMatch>
"""

def main():
    if os.path.exists(DIST): shutil.rmtree(DIST)
    os.makedirs(DIST)
    for x in INCLUDI:
        src = os.path.join(ROOT, x)
        if os.path.isdir(src): shutil.copytree(src, os.path.join(DIST, x))
        else: shutil.copy2(src, os.path.join(DIST, x))
    n = 0
    for base, _, files in os.walk(DIST):
        for f in files:
            if not f.endswith(TESTO): continue
            p = os.path.join(base, f)
            s = open(p, encoding='utf8', errors='surrogateescape').read()
            t = s.replace(VECCHIO, DOMINIO)
            if ONLINE and f.endswith('.html') and not base.endswith('gestionale-v2'):
                t = t.replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow,max-image-preview:large">')
            if t != s:
                open(p, 'w', encoding='utf8', errors='surrogateescape').write(t); n += 1
    open(os.path.join(DIST, '.htaccess'), 'w').write(HTACCESS)
    oggi = datetime.date.today().isoformat()
    if ONLINE:
        open(os.path.join(DIST, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /gestionale-v2/\nAllow: /\n\nSitemap: ' + DOMINIO + 'sitemap.xml\n')
        open(os.path.join(DIST, 'sitemap.xml'), 'w').write(
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + ''.join('  <url><loc>' + DOMINIO + u + '</loc><lastmod>' + oggi + '</lastmod></url>\n' for u in ['', 'impara/'])
            + '</urlset>\n')
    else:
        open(os.path.join(DIST, 'robots.txt'), 'w').write('# copia di prova: niente motori di ricerca\nUser-agent: *\nDisallow: /\n')
    tot = sum(os.path.getsize(os.path.join(b, f)) for b, _, fs in os.walk(DIST) for f in fs)
    print('dist/ pronta:', n, 'file con il dominio nuovo,', round(tot / 1048576, 1), 'MB in tutto', '(MESSA ONLINE)' if ONLINE else '(copia di prova, noindex)')

if __name__ == '__main__':
    main()

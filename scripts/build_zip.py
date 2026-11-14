"""Build the Round 1 Skill ZIP from receipt-shoebox/ with fixed timestamps.

Usage: python3 scripts/build_zip.py OUT.zip [EXTRA_DISCLOSURE.md]
The optional extra file is appended to references/disclosures.md inside the ZIP.
"""
import os, sys, zipfile

root = os.path.join(os.path.dirname(__file__), '..', 'receipt-shoebox')
out = sys.argv[1]
extra = open(sys.argv[2]).read() if len(sys.argv) > 2 else ''
paths = []
for d, _, fs in os.walk(root):
    for f in fs:
        paths.append(os.path.relpath(os.path.join(d, f), root))
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in sorted(paths):
        data = open(os.path.join(root, p), 'rb').read()
        if p == 'references/disclosures.md' and extra:
            data = data.rstrip(b'\n') + b'\n' + extra.encode()
        info = zipfile.ZipInfo('receipt-shoebox/' + p.replace(os.sep, '/'), (2026, 11, 14, 0, 0, 0))
        info.external_attr = 0o644 << 16
        info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info, data)
print(out, os.path.getsize(out), 'bytes', len(paths), 'files')

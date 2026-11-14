"""Render proposal/answers.md to proposal/receipt-shoebox-proposal.pdf."""
import markdown, re, os
from weasyprint import HTML
here = os.path.join(os.path.dirname(__file__), '..', 'proposal')
md = open(os.path.join(here, 'answers.md')).read()
words = len(re.sub(r'^### .*$', '', md, flags=re.M).split())
html = f"""<html><head><meta charset="utf-8"><title>Receipt Shoebox proposal</title><style>
@page {{ size: Letter; margin: 0.6in 0.7in; }}
body {{ font-family: 'DejaVu Sans', sans-serif; font-size: 9.6pt; line-height: 1.38; color: #1b1b1b; }}
.top {{ border-bottom: 4px solid #990000; padding-bottom: 6px; margin-bottom: 8px; }}
h1 {{ color: #011F5B; font-size: 20pt; margin: 0; }}
.meta {{ font-size: 9pt; color: #333; margin-top: 3px; }}
h3 {{ color: #011F5B; font-size: 10.2pt; margin: 9px 0 2px; }}
p {{ margin: 0 0 3px; }}
.lic {{ margin-top: 10px; border-top: 1px solid #011F5B; padding-top: 5px; font-size: 8.6pt; }}
.lic h2 {{ color: #990000; font-size: 10pt; margin: 0 0 3px; }}
</style></head><body>
<div class="top"><h1>Receipt Shoebox</h1>
<div class="meta">UGREEN Hackathon 2026 on AI NAS · Round 1 proposal · Track: Automate Your Workflow<br>
Entrant: John Khan (solo), Toronto, Ontario, Canada · Code and dry run: github.com/ALENZACODES/receipt-shoebox · alenzacodes.github.io/receipt-shoebox<br>
Answers to the ten items: {words} words</div></div>
{markdown.markdown(md)}
<div class="lic"><h2>Third-party components and licenses</h2>
<p>None are bundled. The Skill is plain Markdown and calls only the built-in UGREEN AI NAS experts file-agent, document-agent, photo-agent and knowledge-agent. It was written to the official UGREEN Skill Developer Package (uliya-skill-kit 0.7.7) and checked with its bundled checker; the kit is not redistributed and stays under UGREEN's terms. The dry run page uses no libraries. Project code: MIT License, John Khan.</p></div>
</body></html>"""
out = os.path.join(here, 'receipt-shoebox-proposal.pdf')
HTML(string=html).write_pdf(out, metadata={'title': 'Receipt Shoebox proposal', 'authors': ['John Khan']})
print(out, os.path.getsize(out), 'words', words)

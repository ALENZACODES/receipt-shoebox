# Receipt Shoebox

A UGREEN AI NAS Skill that turns one messy folder of receipts, bills and tax slips into a tidy year-end folder, writes a plain summary, and lists the slips you still need to find.

Built by John Khan in Toronto, Ontario for the UGREEN Hackathon 2026 on AI NAS, Automate Your Workflow track.

Live dry run: https://alenzacodes.github.io/receipt-shoebox/

## What it does

1. Asks for a source folder, a destination folder, a tax year, and optionally the slip types you expect (T4, T5, RRSP contribution receipt and so on).
2. Finds candidate PDFs, documents and images in the source folder.
3. Reads each one with the NAS document extractor, with dedupe on. Images with no text go through vision OCR, then a second extract.
4. Builds a plan from verified results only: a copy map into Tax-slips, Receipts, Bills and Unclear, plus lists of possible duplicates, files from another year, unscanned files, and missing slip types.
5. Waits for your approval. Nothing is created or copied before that.
6. Copies (never moves or deletes) the approved files and saves a Markdown summary in the destination.

## Repository layout

| Path | What it is |
|---|---|
| `receipt-shoebox/` | The Skill package: `SKILL.md` plus four linked references. This is what goes in the ZIP. |
| `site/` | Browser dry run of the same rules on made-up sample files, published with GitHub Pages. |
| `tests/` | Node tests for the dry run rules and for the package format limits. |
| `scripts/build_zip.py` | Builds the Skill ZIP with fixed timestamps. |
| `scripts/build_pdf.py` | Renders the Round 1 proposal PDF from `proposal/answers.md`. |
| `check-result.json` | Output of the official checker on this package. |

## Run the checks

```
for t in tests/*.mjs; do node "$t"; done
```

The official checker ships in the free UGREEN Skill Developer Package (uliya-skill-kit 0.7.7), linked from https://ai.ugreen.com/pages/hackathon-starter-kit. Unzip it next to this repo and run:

```
node uliya-skill-kit/scripts/check-skill.mjs receipt-shoebox
```

Latest result: `static-pass`, 0 errors, 0 warnings, catalog 2.2.0. GitHub Actions runs the tests and the checker on every push before the page deploys.

## Limits

A static pass does not prove install or runtime on a NAS; that is what the finalist testing day is for. Extraction quality depends on the scans. Partial extracts go to Unclear instead of being guessed. The Skill sorts files and gives no tax advice. Slip names come from the Canada Revenue Agency page "Preparing to do your taxes".

## License

MIT for this project. The UGREEN kit is not included and stays under UGREEN's own terms.

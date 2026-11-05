# Devpost copy · Receipt Shoebox · UGREEN Hackathon 2026

## Tagline
Year-end receipt shoebox Skill for UGREEN AI NAS.

## Inspiration
Tax season is a pile of PDFs and phone photos. A home NAS is the right place to sort them once, with approval before anything moves.

## What it does
Asks for a source folder, destination, tax year and optional needed types. Finds candidates, extracts receipt fields, OCRs empty images, waits for approval, copies into year folders, and writes a plain summary plus missing-type list.

## How we built it
Official free UGOS Skill Creation Tool (no account required for the ZIP). Skill uses file-agent, document-agent, photo-agent and knowledge-agent from the public catalog. Bundled checker reports static-pass.

## Challenges we ran into
Matching the checker’s exact section titles and delegate command shape. Keeping empty-result honesty in the workflow.

## Accomplishments that we're proud of
static-pass with zero diagnostics. Clear approval gate before copies.

## What we learned
Generation-time capability evidence has to match the catalog’s unique agent map.

## What's next
Round 2 remote NAS validation if selected. Broader document-type vocabulary.

## Built with
UGOS Skill Creation Tool, ug-filesystem, ug-document, ug-photo, ug-knowledge

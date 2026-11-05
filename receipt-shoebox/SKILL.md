---
name: receipt-shoebox
description: Year-end shoebox summary of receipts, bills, and tax slips on UGREEN NAS, with a missing-type list. Use when the user asks to sort tax papers, organize receipts into a year folder, or build a year-end document checklist on the NAS.
---

# Goal

Organize household receipts, bills, and tax slips from a NAS source folder into a year-end destination, write a plain summary from verified extracts only, and list needed document types that were not found.

# Required input

- `source_path`: folder to scan
- `destination_path`: year-end folder
- `tax_year`: four-digit year
- `needed_types` (optional): types to watch for

If any required field is missing, return `waiting_user`. Do not pre-collect private parameters owned by child experts.

# Generation-time capability evidence

- `ug-filesystem` → `file-agent`
- `ug-document` → `document-agent`
- `ug-photo` → `photo-agent`
- `ug-knowledge` → `knowledge-agent`

# Orchestration

1. Confirm inputs with the user. On missing required input, stop with `waiting_user`.

2. Discover candidates. Empty scans must be reported as an empty result with no invented paths:

delegate --target file-agent --instruction 'List and find document and image candidates under the user-provided source_path using ug-filesystem ls and find. Return only real paths. If the folder is empty or unreadable, return an empty result and explain why. Do not invent files.'

3. Extract facts from each verified real result path returned by the upstream file-agent step:

delegate --target document-agent --instruction 'For each verified document path from file-agent, run ug-document extract with receipt or expense schema. Return merchant or payer, document date, total, currency, and document type. Label partial extracts clearly. Never invent amounts or dates.'

4. OCR image paths that had empty document text, using only those verified paths:

delegate --target photo-agent --instruction 'For each verified image path that document-agent marked empty, run ug-photo vision-ocr and return OCR text or an explicit empty result. Do not invent text.'

5. If OCR text exists, pass that real OCR text back for a second extract:

delegate --target document-agent --instruction 'Using only OCR text returned by photo-agent, extract merchant or payer, document date, total, currency, and document type. If OCR text is empty, mark the file unscanned and continue.'

6. Show the planned copy map and missing types to the user. Wait for approval before any state change (`waiting_approval`). After approval, create folders and copy files:

delegate --target file-agent --instruction 'Using only the approved plan, create destination_path subfolders with ug-filesystem mkdir parents true, then copy each approved source file with ug-filesystem cpmv type copy. Do not overwrite unless the user approved overwrite. Stop remaining copies if a required copy fails. Never delete source files.'

7. Save the summary from verified results only:

delegate --target knowledge-agent --instruction 'Write destination_path/YEAR-END-SUMMARY.md with ug-knowledge save-text. Include only verified file counts, destinations, unscanned files, and missing types from needed_types. If a list is an empty result, say so. Do not invent documents.'

# Completion and failure

- `completed`: approved copies finished and summary saved; report counts, destination, missing types, unscanned files.
- `failed`: a required expert call failed; report the step and any partial verified paths.
- `cancelled`: user cancelled; do not start new state changes.
- `waiting_user`: required input missing.
- `waiting_approval`: plan ready; no copies or summary writes yet.
- Never invent NAS files, dates, or amounts. Stop dependent steps when required upstream results are missing or empty.

# References

- [Year folder layout](references/year-folder-layout.md)
- [Missing document checklist](references/missing-document-checklist.md)

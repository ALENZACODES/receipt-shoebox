---
name: receipt-shoebox
description: Year-end shoebox for household receipts, bills, and tax slips on UGREEN AI NAS. Finds candidate files in one source folder, extracts merchant, date, total, and document type, flags copies and documents from another year, waits for approval, copies files into a year-end folder, saves a plain summary, and lists needed document types that were not found. Use when the user asks to sort tax papers, gather receipts for a tax year, or check which slips are still missing.
---

# Goal

Turn one messy NAS folder of receipts, bills, and tax slips into a tidy year-end folder for one tax year, with a plain summary built only from verified extracts and a clear list of needed document types that were not found. Source files are never moved or deleted.

# Required input

- `source_path`: NAS folder to scan
- `destination_path`: NAS folder for the year-end copy
- `tax_year`: four-digit year
- `needed_types` (optional): document types to check for, for example T4, T5, RRSP contribution receipt, or Medical receipt. The user may pick from [Canadian slip and receipt types](references/canada-slip-types.md).

If any required field is missing, return `waiting_user`. Do not pre-collect private parameters owned by child experts.

# Generation-time capability evidence

- `ug-filesystem` → `file-agent`
- `ug-document` → `document-agent`
- `ug-photo` → `photo-agent`
- `ug-knowledge` → `knowledge-agent`

# Orchestration

1. Confirm inputs with the user. On missing required input, stop with `waiting_user`.

2. Discover candidates. Empty scans must be reported as an empty result with no invented paths:

delegate --target file-agent --instruction 'List and find PDF, document, and image candidates under the user-provided source_path using ug-filesystem ls and find. Return only real paths. If the folder is empty or unreadable, return an empty result and explain why. Do not invent files.'

3. Extract facts from each verified real result path returned by the upstream file-agent step:

delegate --target document-agent --instruction 'For each verified document path from file-agent, run ug-document extract with the receipt, invoice, or expense schema and dedupe on. Return merchant or payer, document date, total, currency, document type, and any suspicious copy flag. Label partial extracts clearly. Never invent amounts or dates.'

4. OCR image paths that had empty document text, using only those verified paths:

delegate --target photo-agent --instruction 'For each verified image path that document-agent marked empty, run ug-photo vision-ocr and return OCR text or an explicit empty result. Do not invent text.'

5. If OCR text exists, pass that real OCR text back for a second extract:

delegate --target document-agent --instruction 'Using only OCR text returned by photo-agent, extract merchant or payer, document date, total, currency, and document type. If OCR text is empty, mark the file unscanned and continue.'

6. Build the plan from verified extracts only. Sort each file into one folder from the [year folder layout](references/year-folder-layout.md). Files dated outside tax_year go to an other year list and are not copied unless the user asks. Files flagged as suspicious copies are listed once as possible duplicates. Compare found types with needed_types using the [missing document checklist](references/missing-document-checklist.md). Show the copy map, possible duplicates, other year files, unscanned files, and missing types to the user, then wait for approval before any state change (`waiting_approval`).

7. After approval, create folders and copy files:

delegate --target file-agent --instruction 'Using only the approved plan, create destination_path subfolders with ug-filesystem mkdir parents true, then copy each approved source file with ug-filesystem cpmv type copy. Do not overwrite unless the user approved overwrite. Stop remaining copies if a required copy fails. Never delete or move source files.'

8. Save the summary from verified results only:

delegate --target knowledge-agent --instruction 'Save a Markdown year-end summary into the user-provided destination_path with ug-knowledge save-text, filename hint year-end-summary. Include only verified file counts per folder, destinations, possible duplicates, other year files, unscanned files, and missing types from needed_types. If a list is an empty result, say so. Do not invent documents or totals.'

# Completion and failure

- `completed`: approved copies finished and summary saved; report counts, destination, summary path, missing types, possible duplicates, and unscanned files.
- `failed`: a required expert call failed; report the step and any partial verified paths.
- `cancelled`: user cancelled; do not start new state changes.
- `waiting_user`: required input missing.
- `waiting_approval`: plan ready; no copies or summary writes yet.
- Never invent NAS files, dates, or amounts. Stop dependent steps when required upstream results are missing or empty. An empty source folder completes with an empty result and no folders created.

# References

- [Year folder layout](references/year-folder-layout.md)
- [Missing document checklist](references/missing-document-checklist.md)
- [Canadian slip and receipt types](references/canada-slip-types.md)
- [Disclosures](references/disclosures.md)

### 1. What does your Skill do?
Receipt Shoebox sorts one messy NAS folder of receipts, bills and tax slips into a year-end folder, writes a plain summary, and lists the slips that are still missing.

### 2. Who is your target user, and what is their problem?
Households who file their own taxes. Slips arrive by mail, email and phone photo, land in one scan folder, and at filing time people still have to work out which T4, T5 or RRSP receipt is there, which is a copy, and which is missing.

### 3. What is your solution?
A Skill that reads every candidate file with the NAS's own extraction and OCR, sorts verified results into Tax-slips, Receipts, Bills and Unclear, flags copies and documents from another year, waits for approval, copies (never moves), and saves a summary with a Found or Missing line for each needed type.

### 4. What is the main user flow?
The user names a source folder, a destination, a tax year and optionally the slip types they expect. The Skill shows a plan: copy map, possible duplicates, other year files, unscanned files and missing types. The user approves or cancels. After approval the copies run and the summary is saved in the destination.

### 5. How is your idea different from existing tools or common AI solutions?
Cloud receipt apps upload private tax papers and focus on spending. Receipt Shoebox keeps files on the NAS, reports only what was really extracted, labels unscanned files instead of guessing, and is built around a year-end checklist of what is missing.

### 6. Which UGREEN AI NAS features does your Skill use, and at which step?
Discovery: file-agent with ug-filesystem ls and find. Extraction: document-agent with ug-document extract, receipt, invoice or expense schema, dedupe on. Images without text: photo-agent with ug-photo vision-ocr, then a second extract. Copying: file-agent with ug-filesystem mkdir and cpmv. Summary: knowledge-agent with ug-knowledge save-text.

### 7. What is your technical approach?
One SKILL.md orchestration with four linked references, written to the Uliya Skill Development Standard. Inputs: source_path, destination_path, tax_year. Every state change waits for approval. Each step passes only verified upstream paths; empty results stop dependent steps. Models are the NAS's own extraction and OCR. No data leaves the NAS and no credentials are stored.

### 8. What have you built so far? What is not built yet? What still needs testing on a NAS?
Built: the complete Skill package, which passes the official checker (uliya-skill-kit 0.7.7, static-pass, 0 diagnostics), and a public browser dry run of the same rules with automated tests. Not built: rename rules and multi-year batches. Needs NAS testing: real extract fields on scanned slips, OCR quality on phone photos, and the saved summary path.

### 9. How will you test your Skill if you become a Finalist?
Core test one: a folder with a T4, two RRSP receipts (one a copy) and a utility bill gives three copies, one duplicate and the right folders. Core test two: a phone photo of a pharmacy receipt is read by OCR and filed under Receipts with its total. Edge case: an empty or unreadable folder returns an empty result and creates nothing.

### 10. What are the known limits, risks, or outside dependencies of your Skill?
Accuracy depends on NAS extraction and OCR quality; partial extracts go to Unclear. Slip type names vary by issuer. The Skill sorts files and gives no tax advice. It depends only on the four built-in NAS experts.

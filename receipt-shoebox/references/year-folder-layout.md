# Year folder layout

Suggested destination layout after approval:

```
{destination_path}/
  Tax-slips/
  Receipts/
  Bills/
  Unclear/
  year-end-summary (timestamped Markdown file saved by knowledge-agent)
```

Folder rules, applied only to verified extracts:

- Tax-slips: information slips and official receipts such as T4, T4A, T4E, T5, T3, T5007, T5008, T2202, RRSP contribution receipts, and donation receipts.
- Receipts: purchase receipts, including medical, child care, and moving receipts.
- Bills: utility, phone, internet, rent, and other recurring statements.
- Unclear: files with a partial extract or no clear type. Unscanned files are listed, not guessed.

Only create folders that will receive at least one approved file. Keep original filenames unless the user asked for a rename rule. Files dated outside tax_year are not copied by default.

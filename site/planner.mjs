// Dry run of the Receipt Shoebox workflow on synthetic files.
// Mirrors the rules in receipt-shoebox/SKILL.md so the logic can be tested in a browser.

export const FOLDERS = ['Tax-slips', 'Receipts', 'Bills', 'Unclear'];

const SLIP_TYPES = ['T4', 'T4A', 'T4E', 'T5', 'T3', 'T5007', 'T5008', 'T2202',
  'RRSP contribution receipt', 'Donation receipt'];
const RECEIPT_TYPES = ['Receipt', 'Medical receipt', 'Child care receipt', 'Moving receipt'];
const BILL_TYPES = ['Utility bill', 'Phone bill', 'Internet bill', 'Rent statement'];
const CANDIDATE_EXT = /\.(pdf|png|jpe?g|heic|tiff?|docx?|txt)$/i;
const IMAGE_EXT = /\.(png|jpe?g|heic|tiff?)$/i;

export function folderFor(type) {
  if (SLIP_TYPES.includes(type)) return 'Tax-slips';
  if (RECEIPT_TYPES.includes(type)) return 'Receipts';
  if (BILL_TYPES.includes(type)) return 'Bills';
  return 'Unclear';
}

function complete(x) {
  return Boolean(x && x.type && x.date && x.total != null && x.payer);
}

// Simulates steps 2 to 6: discover, extract, OCR fallback, second extract, plan.
export function plan(input) {
  const { sourceFiles, taxYear, neededTypes = null, destinationPath, sourcePath } = input || {};
  const missingInput = [];
  if (!sourcePath) missingInput.push('source_path');
  if (!destinationPath) missingInput.push('destination_path');
  if (!/^\d{4}$/.test(String(taxYear ?? ''))) missingInput.push('tax_year');
  if (missingInput.length) return { status: 'waiting_user', missingInput };

  const candidates = (sourceFiles || []).filter(f => CANDIDATE_EXT.test(f.path));
  if (candidates.length === 0) {
    return { status: 'completed', empty: true, copies: [], folders: [], duplicates: [],
      otherYear: [], unscanned: [], partial: [], found: {}, missing: neededTypes ? [...neededTypes] : null,
      note: 'No receipt, bill, or slip candidates were found in the source folder. Nothing was created.' };
  }

  const copies = [], duplicates = [], otherYear = [], unscanned = [], partial = [];
  const seen = new Map();
  const found = {};
  for (const f of candidates) {
    let x = f.extract || null;
    let via = 'document';
    if (!x && IMAGE_EXT.test(f.path)) {
      if (f.ocrText && f.ocrExtract) { x = f.ocrExtract; via = 'ocr'; }
      else { unscanned.push(f.path); continue; }
    }
    if (!x) { unscanned.push(f.path); continue; }
    const year = x.date ? Number(String(x.date).slice(0, 4)) : null;
    if (year && year !== Number(taxYear)) { otherYear.push({ path: f.path, date: x.date }); continue; }
    const key = complete(x) ? [x.payer, x.date, Number(x.total).toFixed(2), x.type].join('|') : null;
    if (key && seen.has(key)) { duplicates.push({ path: f.path, sameAs: seen.get(key) }); continue; }
    if (key) seen.set(key, f.path);
    const isComplete = complete(x);
    const folder = isComplete ? folderFor(x.type) : 'Unclear';
    if (!isComplete) partial.push(f.path);
    copies.push({ src: f.path, folder, dst: `${destinationPath}/${folder}/`, type: x.type || null,
      payer: x.payer || null, date: x.date || null, total: x.total ?? null, currency: x.currency || null, via });
    if (isComplete) (found[x.type] ||= []).push(f.path);
  }
  const folders = FOLDERS.filter(name => copies.some(c => c.folder === name));
  const missing = neededTypes ? neededTypes.filter(t => !found[t]) : null;
  return { status: 'waiting_approval', copies, folders, duplicates, otherYear, unscanned, partial, found, missing };
}

// Simulates steps 7 and 8 after the user approves.
export function approve(planned, { approved = true, destinationPath, taxYear } = {}) {
  if (planned.status !== 'waiting_approval') return planned;
  if (!approved) return { ...planned, status: 'cancelled', copies: [], summary: null };
  return { ...planned, status: 'completed', summary: summary(planned, destinationPath, taxYear) };
}

function money(n) { return Number(n).toFixed(2); }

export function summary(p, destinationPath, taxYear) {
  const lines = [`# Year-end summary ${taxYear}`, '', `Destination: ${destinationPath}`, ''];
  lines.push('## Copied');
  for (const name of p.folders) {
    const n = p.copies.filter(c => c.folder === name).length;
    lines.push(`- ${name}: ${n} file${n === 1 ? '' : 's'}`);
  }
  if (!p.folders.length) lines.push('- None (empty result)');
  const totals = {};
  for (const c of p.copies) if (c.folder === 'Receipts' && c.total != null) {
    totals[c.currency || '?'] = (totals[c.currency || '?'] || 0) + Number(c.total);
  }
  if (Object.keys(totals).length) {
    lines.push('', '## Receipt totals (verified extracts only)');
    for (const [cur, t] of Object.entries(totals)) lines.push(`- ${cur} ${money(t)}`);
  }
  const list = (title, items, fmt) => {
    lines.push('', `## ${title}`);
    if (!items || !items.length) lines.push('- None (empty result)');
    else for (const i of items) lines.push(`- ${fmt(i)}`);
  };
  list('Possible duplicates (not copied)', p.duplicates, d => `${d.path} looks like ${d.sameAs}`);
  list('Other year (not copied)', p.otherYear, o => `${o.path} dated ${o.date}`);
  list('Unscanned (no text found)', p.unscanned, u => u);
  if (p.missing === null) lines.push('', '## Missing types', '- No needed types were given, so this list was skipped.');
  else list('Missing types', p.missing, m => m);
  return lines.join('\n') + '\n';
}

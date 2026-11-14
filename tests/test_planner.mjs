import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { plan, approve, folderFor } from '../site/planner.mjs';

const s = JSON.parse(readFileSync(new URL('../site/samples.json', import.meta.url)));
const base = { sourcePath: s.sourcePath, destinationPath: s.destinationPath, taxYear: s.taxYear,
  neededTypes: s.neededTypes, sourceFiles: s.sourceFiles };

// Missing input stops with waiting_user.
let p = plan({ ...base, destinationPath: '' });
assert.equal(p.status, 'waiting_user');
assert.deepEqual(p.missingInput, ['destination_path']);
assert.equal(plan({ ...base, taxYear: '25' }).status, 'waiting_user');

// Empty folder is an empty result, nothing invented.
p = plan({ ...base, sourceFiles: [] });
assert.equal(p.status, 'completed');
assert.equal(p.empty, true);
assert.equal(p.copies.length, 0);

// Full sample.
p = plan(base);
assert.equal(p.status, 'waiting_approval');
const by = f => p.copies.find(c => c.src.endsWith(f));
assert.equal(by('t4-example-employer.pdf').folder, 'Tax-slips');
assert.equal(by('rrsp-receipt-feb.pdf').folder, 'Tax-slips');
assert.equal(by('pharmacy-march.jpg').folder, 'Receipts');
assert.equal(by('pharmacy-march.jpg').via, 'ocr');
assert.equal(by('hydro-november.pdf').folder, 'Bills');
assert.equal(by('note-from-bank.pdf').folder, 'Unclear');
assert.equal(p.copies.length, 5);
assert.equal(p.duplicates.length, 1);
assert.ok(p.duplicates[0].path.endsWith('rrsp-receipt-feb-copy.pdf'));
assert.deepEqual(p.otherYear.map(o => o.path.split('/').pop()), ['dentist-2024.pdf']);
assert.deepEqual(p.unscanned.map(u => u.split('/').pop()), ['blurry-photo.png']);
assert.ok(!p.copies.some(c => c.src.endsWith('.mp4')), 'video is not a candidate');
assert.deepEqual(p.missing, ['T5', 'T2202']);
assert.deepEqual(p.folders, ['Tax-slips', 'Receipts', 'Bills', 'Unclear']);

// Nothing needed given: missing list skipped.
assert.equal(plan({ ...base, neededTypes: null }).missing, null);

// Approval gate.
const done = approve(p, { approved: true, destinationPath: base.destinationPath, taxYear: 2025 });
assert.equal(done.status, 'completed');
assert.match(done.summary, /Tax-slips: 2 files/);
assert.match(done.summary, /Receipts: 1 file\n/);
assert.match(done.summary, /CAD 42\.17/);
assert.match(done.summary, /## Missing types\n- T5\n- T2202/);
assert.match(done.summary, /dentist-2024\.pdf dated 2024-12-02/);
const no = approve(p, { approved: false });
assert.equal(no.status, 'cancelled');
assert.equal(no.copies.length, 0);

// Tax year change moves the dentist receipt in and others out.
p = plan({ ...base, taxYear: 2024 });
assert.equal(p.copies.length, 1);
assert.equal(p.copies[0].folder, 'Receipts');

assert.equal(folderFor('T5008'), 'Tax-slips');
assert.equal(folderFor('Rent statement'), 'Bills');
assert.equal(folderFor('Something else'), 'Unclear');
console.log('planner tests passed');

import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../receipt-shoebox/', import.meta.url).pathname;
const walk = d => readdirSync(d).flatMap(n => statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]);
const files = walk(root).map(f => relative(root, f));
const skill = readFileSync(join(root, 'SKILL.md'), 'utf8');

const fm = skill.match(/^---\nname: (.+)\ndescription: (.+)\n---\n/);
assert.ok(fm, 'frontmatter has only name and description');
assert.match(fm[1], /^[a-z0-9]+(-[a-z0-9]+)*$/);
assert.ok(fm[1].length >= 2 && fm[1].length <= 64);
assert.ok(fm[2].length <= 1024, 'description at most 1024 characters');
for (const h of ['# Goal', '# Required input', '# Generation-time capability evidence', '# Orchestration', '# Completion and failure'])
  assert.ok(skill.includes('\n' + h + '\n'), 'section ' + h);

assert.ok(files.every(f => f.endsWith('.md')), 'Markdown only, no scripts or binaries');
assert.ok(files.length <= 100);
for (const f of files) {
  assert.ok(statSync(join(root, f)).size < 1024 * 1024, f + ' under 1 MB');
  if (f !== 'SKILL.md') {
    assert.ok(f.startsWith('references/'), f + ' lives under references/');
    assert.ok(skill.includes('](' + f + ')'), f + ' is linked from SKILL.md');
  }
}
const links = [...skill.matchAll(/\]\((references\/[^)]+)\)/g)].map(m => m[1]);
for (const l of links) assert.ok(files.includes(l), 'link target exists: ' + l);

const all = files.map(f => readFileSync(join(root, f), 'utf8')).join('\n');
assert.ok(!/api[_-]?key\s*[:=]|password\s*[:=]|token\s*[:=]/i.test(all), 'no credentials');
for (const agent of ['file-agent', 'document-agent', 'photo-agent', 'knowledge-agent'])
  assert.ok(skill.includes('delegate --target ' + agent), 'delegates to ' + agent);
assert.ok(/waiting_approval/.test(skill) && /Never delete or move source files/.test(skill));
console.log('package tests passed (' + files.length + ' files)');

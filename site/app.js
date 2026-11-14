import { plan, approve } from './planner.mjs';

const TYPES = ['T4', 'T4A', 'T4E', 'T5', 'T3', 'T5008', 'T2202', 'RRSP contribution receipt',
  'Medical receipt', 'Child care receipt', 'Donation receipt'];
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const short = p => p.split('/').pop();
let samples, current;

function setStatus(s) { const el = $('status'); el.textContent = s; el.className = 'status s-' + s; }

function list(title, items, fmt) {
  const body = items && items.length ? items.map(i => `<li>${fmt(i)}</li>`).join('') : '<li>None</li>';
  return `<div><h3>${esc(title)}</h3><ul>${body}</ul></div>`;
}

function inputs() {
  const scenario = $('scenario').value;
  return {
    sourcePath: $('src').value.trim(),
    destinationPath: $('dst').value.trim(),
    taxYear: Number($('year').value),
    neededTypes: [...document.querySelectorAll('#types input:checked')].map(i => i.value),
    sourceFiles: scenario === 'empty' ? [] : samples.sourceFiles
  };
}

function render(p) {
  setStatus(p.status);
  $('actions').innerHTML = ''; $('result').innerHTML = '';
  if (p.status === 'waiting_user') {
    $('plan').innerHTML = `<p>Missing required input: <strong>${p.missingInput.map(esc).join(', ')}</strong>. The Skill stops here and asks you.</p>`;
    return;
  }
  if (p.empty) { $('plan').innerHTML = `<p>${esc(p.note)}</p>`; return; }
  const rows = p.copies.map(c => `<tr><td>${esc(short(c.src))}${c.via === 'ocr' ? ' <span class="tag">OCR</span>' : ''}</td>
    <td>${esc(c.type || 'unclear')}</td><td>${esc(c.date || '')}</td>
    <td>${c.total != null ? esc(c.currency) + ' ' + Number(c.total).toFixed(2) : ''}</td>
    <td><span class="tag${c.folder === 'Unclear' ? ' red' : ''}">${esc(c.folder)}</span></td></tr>`).join('');
  $('plan').innerHTML = `<table><thead><tr><th>File</th><th>Type</th><th>Date</th><th>Total</th><th>Copy to</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="cols">
      ${list('Possible duplicates (not copied)', p.duplicates, d => `${esc(short(d.path))} looks like ${esc(short(d.sameAs))}`)}
      ${list('Other year (not copied)', p.otherYear, o => `${esc(short(o.path))} (${esc(o.date)})`)}
      ${list('Unscanned', p.unscanned, u => esc(short(u)))}
      ${list('Missing types', p.missing, m => esc(m))}
    </div>`;
  if (p.status === 'waiting_approval') {
    $('actions').innerHTML = `<button class="primary" id="ok">Approve copies</button><button class="danger" id="no">Cancel</button>`;
    $('ok').onclick = () => finish(true);
    $('no').onclick = () => finish(false);
  }
}

function finish(ok) {
  const i = inputs();
  const done = approve(current, { approved: ok, destinationPath: i.destinationPath, taxYear: i.taxYear });
  setStatus(done.status);
  $('actions').innerHTML = '';
  $('result').innerHTML = ok
    ? `<h2 style="margin-top:16px">3. Saved summary</h2><pre>${esc(done.summary)}</pre>`
    : '<p>Cancelled. No folders were created and nothing was copied.</p>';
}

async function main() {
  samples = await (await fetch('samples.json')).json();
  $('src').value = samples.sourcePath; $('dst').value = samples.destinationPath;
  $('types').innerHTML = TYPES.map(t => `<label><input type="checkbox" value="${esc(t)}" ${samples.neededTypes.includes(t) ? 'checked' : ''}> ${esc(t)}</label>`).join('');
  $('run').onclick = () => { current = plan(inputs()); render(current); };
}
main();

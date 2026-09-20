const $ = (id) => document.getElementById(id);
const samples = {
  thanks: 'いつも安定していて助かります。ありがとうございます！',
  sarcasm: 'また障害ですか。さすが、安定していますね。',
  urgent: '決済が止まって売上が発生していません。今すぐ調査してください！',
  ambiguous: 'さすがですね。'
};
const history = [];
document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', () => {
  $('message').value = samples[button.dataset.sample];
  $('message').focus();
}));
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function card(title, value, description, probabilities) {
  const node = element('article', undefined, 'answer');
  node.append(element('h3', title), element('div', value, 'value'), element('p', description));
  for (const [label, probability] of Object.entries(probabilities || {})) {
    const row = element('div', undefined, 'distribution');
    const bar = element('progress');
    bar.max = 1; bar.value = probability; bar.setAttribute('aria-label', label);
    row.append(element('span', label), bar, element('span', `${(probability * 100).toFixed(1)}%`));
    node.append(row);
  }
  return node;
}
$('form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if ($('submit').disabled) return;
  const input = { message: $('message').value.trim() };
  if (!input.message) { $('status').textContent = '文章を入力してください。'; return; }
  $('submit').disabled = true;
  $('submit').textContent = 'Jev が判断しています…';
  $('status').className = '';
  $('status').textContent = '3つの質問をまとめて送信中…';
  $('answers').replaceChildren(); $('timing').textContent = '';
  try {
    const response = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'リクエストに失敗しました。');
    const { sarcasm, intent, urgency } = data.response.answers;
    $('answers').append(
      card('NOUL / 皮肉を含む確率', `${(sarcasm.noul * 100).toFixed(1)}%`, 'Yes の確率です。皮肉の強さではありません。'),
      card('CHOICE / 発言の主な意図', intent.choice, `確信度 ${(intent.confidence * 100).toFixed(1)}% · 各選択肢の確率`, intent.probabilities),
      card('SCORE / 対応の緊急度', `${urgency.score.toFixed(2)} / 2`, `0：急がない · 1：期限あり · 2：即時対応 ／ 確信度 ${(urgency.confidence * 100).toFixed(1)}%`)
    );
    for (const [title, value] of [
      ['Raw request · POST /v1/systemone', data.request],
      ['Raw response · TypeSafe API', data.response]
    ]) {
      const details = element('details');
      details.open = true;
      details.append(element('summary', title), element('pre', JSON.stringify(value, null, 2)));
      $('answers').append(details);
    }
    $('status').textContent = `「${input.message.slice(0, 65)}${input.message.length > 65 ? '…' : ''}」の結果`;
    $('timing').textContent = `${data.response.model} · ${(data.elapsedMs / 1000).toFixed(2)}s`;
    history.unshift({ input, label: `${input.message.slice(0, 45)}\n皮肉 ${(sarcasm.noul * 100).toFixed(1)}% · ${intent.choice} · 緊急度 ${urgency.score.toFixed(2)}` });
    history.splice(5); $('history').replaceChildren(); $('history-section').hidden = false;
    for (const entry of history) {
      const button = element('button', entry.label, 'history-item');
      button.type = 'button';
      button.addEventListener('click', () => { $('message').value = entry.input.message; $('message').focus(); });
      $('history').append(button);
    }
  } catch (error) { $('status').className = 'error'; $('status').textContent = error.message; }
  finally { $('submit').disabled = false; $('submit').textContent = 'Jev に聞いてみる ↗'; }
});
$('form').addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); $('form').requestSubmit(); }
});

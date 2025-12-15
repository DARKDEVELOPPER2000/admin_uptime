const $ = (s, r=document) => r.querySelector(s);

export function setTitle(t){
  document.title = `UPTIME Admin • ${t}`;
  const el = $('#page-title');
  if (el) el.textContent = t;
}

export function toast(title, message, kind='ok'){
  const wrap = $('#toast-wrap');
  if (!wrap) return;

  const node = document.createElement('div');
  node.className = 'toast';

  const icon = document.createElement('div');
  icon.className = 'ticon';
  icon.textContent = kind === 'danger' ? '⛔' : kind === 'warn' ? '⚠️' : '✅';

  const body = document.createElement('div');
  body.innerHTML = `<b>${escapeHtml(title)}</b><p>${escapeHtml(message)}</p>`;

  node.appendChild(icon);
  node.appendChild(body);

  wrap.appendChild(node);

  setTimeout(() => {
    node.style.opacity = '0';
    node.style.transform = 'translateY(6px)';
    node.style.transition = '.22s ease';
  }, 2600);

  setTimeout(() => node.remove(), 3000);
}

function escapeHtml(s){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

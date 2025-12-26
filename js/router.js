import { setTitle, toast } from './utils.js';
import { bindPage } from './store.js';

const $ = (s, r = document) => r.querySelector(s);

const routes = {
  '#/dashboard': { file: 'pages/dashboard.html', title: 'Dashboard' },
  '#/map': { file: 'pages/map.html', title: 'Map overview' },
  '#/job-follow': { file: 'pages/job_follow.html', title: 'Job in progress' },
  '#/accounts-create': { file: 'pages/accounts_create.html', title: 'Create an account' },
  '#/job-create': { file: 'pages/job_create.html', title: 'Create a job' },
  '#/settings': { file: 'pages/settings.html', title: 'Settings' },
  '#/login': { file: 'pages/login.html', title: 'Sign in' },
};

export function go(hash) {
  location.hash = hash;
}

export function initRouter() {
  window.addEventListener('hashchange', render);
  render();
}

async function render() {
  const hash = location.hash || '#/dashboard';
  const r = routes[hash] || routes['#/dashboard'];

  // set title
  setTitle(r.title);

  // sidebar active
  document.querySelectorAll('.sb-item[data-route]').forEach(a => {
    const ok = a.getAttribute('data-route') === hash;
    a.classList.toggle('active', ok);
  });

  // load page
  try {
    const html = await fetch(r.file).then(res => res.text());
    $('#app-content').innerHTML = html;

    // bind page events (per page)
    bindPage(hash);

    // ✅ IMPORTANT: in a SPA, <script> tags inside innerHTML won't execute.
    // So we boot the map page here.
    if (hash === '#/map') {
      const mod = await import('./map.page.js');
      await mod.bootMapPage();
    }

  } catch (e) {
    console.error(e);
    toast('Error', 'Unable to load the page.', 'danger');
  }
}

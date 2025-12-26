// js/app.js
import { initRouter, go } from './router.js';
import { toast } from './utils.js';

const $ = (s, r = document) => r.querySelector(s);

function ensureSidebarOverlay() {
  let ov = document.querySelector('.sb-overlay');
  if (ov) return ov;

  ov = document.createElement('div');
  ov.className = 'sb-overlay';
  document.body.appendChild(ov);

  ov.addEventListener('click', () => closeSidebar());
  return ov;
}

function openSidebar() {
  document.body.classList.add('sb-open');
}
function closeSidebar() {
  document.body.classList.remove('sb-open');
}
function toggleSidebar() {
  document.body.classList.toggle('sb-open');
}

async function loadPartials() {
  // sidebar
  const sb = await fetch('components/sidebar.html').then((r) => r.text());
  $('#sidebar').innerHTML = sb;

  // navbar
  const nb = await fetch('components/navbar.html').then((r) => r.text());
  $('#navbar').innerHTML = nb;

  // overlay (mobile drawer)
  ensureSidebarOverlay();

  wireGlobalUI();
}

function wireGlobalUI() {
  // ✅ Burger
  const burger = $('#btn-burger');
  burger?.addEventListener('click', () => toggleSidebar());

  // ✅ ESC close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Sidebar route clicks
  document.querySelectorAll('.sb-item[data-route]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const route = a.getAttribute('data-route');
      location.hash = route;

      // ✅ on mobile, close after click
      closeSidebar();
    });
  });

  // Logout mock
  const logout = $('#btn-logout');
  if (logout) {
    logout.addEventListener('click', () => {
      toast('Session', 'Signed out (mock).', 'ok');
      closeSidebar();
      location.hash = '#/login';
    });
  }

  // Navbar quick actions
  $('#btn-quick-job')?.addEventListener('click', () => {
    closeSidebar();
    go('#/job-create');
  });
  $('#btn-quick-account')?.addEventListener('click', () => {
    closeSidebar();
    go('#/accounts-create');
  });

  // Global search
  const input = $('#global-search');
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      toast('Search', `Search: "${input.value}" (mock)`, 'ok');
    }
  });

  // Ctrl+K focus
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      input?.focus();
    }
  });
}

async function main() {
  await loadPartials();
  initRouter();

  // ✅ default route if no hash
  if (!location.hash) location.hash = '#/dashboard';
}

main().catch((err) => {
  console.error(err);
  toast('Error', 'Unable to start the application.', 'danger');
});

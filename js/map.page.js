// js/map.page.js
import {
  ensureGoogleMapsLoaded,
  initMap,
  setGarages,
  focusGarage,
  fitAll,
  clearFocus,
  getGarages,
} from './map.js';

const GOOGLE_MAPS_WEB_KEY = '';

function log(...a) { console.log('[MAP_PAGE]', ...a); }
function warn(...a) { console.warn('[MAP_PAGE]', ...a); }
function err(...a) { console.error('[MAP_PAGE]', ...a); }

function $(s, r = document) { return r.querySelector(s); }

function showMapDebug(msg) {
  const el = $('#map-debug');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
}

function stampNow() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function pillClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('active')) return 'ok';
  if (s.includes('busy') || s.includes('occup')) return 'warn';
  return 'soft';
}

function renderTable(list) {
  const tbody = $('#sp-list');
  if (!tbody) return;

  tbody.innerHTML = list.map(g => `
    <tr>
      <td><b>${g.name}</b></td>
      <td><span class="pill ${pillClass(g.status)}">${g.status || '—'}</span></td>
      <td>${g.zone || '—'}</td>
      <td>
        <button class="btn ghost btn-mini" data-follow="${g.id}" type="button">View</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-follow]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-follow');
      const g = focusGarage(id);
      if (g) {
        $('#map-focus-name').textContent = g.name;
        showMapDebug(`📍 Focus: ${g.name}`);
      } else {
        showMapDebug(`⚠️ Garage not found (id=${id})`);
      }
    });
  });
}

function applySearch(q) {
  const all = getGarages();
  const s = String(q || '').trim().toLowerCase();
  if (!s) return all;
  return all.filter(g =>
    String(g.name || '').toLowerCase().includes(s) ||
    String(g.zone || '').toLowerCase().includes(s) ||
    String(g.status || '').toLowerCase().includes(s)
  );
}

// ✅ OPTION: catch global “Uncaught (in promise)”
function installGlobalCatcher() {
  window.addEventListener('unhandledrejection', (event) => {
    warn('UNHANDLED_REJECTION:', event.reason);

    const r = event.reason;
    const msg = r?.message || r?.msg || '';
    const path = r?.reqInfo?.path || '';

    if (String(path).includes('/writing/get_template_list') || String(msg).includes('permission error')) {
      warn('IGNORED writing permission error:', { msg, path, reason: r });
      event.preventDefault();
      return;
    }

    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    warn('WINDOW_ERROR:', event.message, event.filename, event.lineno);
  });

  log('Global catcher installed ✅');
}

export async function bootMapPage() {
  installGlobalCatcher();

  showMapDebug('Loading map...');
  $('#map-last-sync').textContent = stampNow();

  const gmap = document.getElementById('gmap');
  if (!gmap) {
    err('❌ #gmap not found');
    showMapDebug('Error: #gmap not found.');
    return;
  }

  // ✅ Ensure the container has a size (otherwise Google Maps can render incorrectly)
  requestAnimationFrame(async () => {
    try {
      await ensureGoogleMapsLoaded(GOOGLE_MAPS_WEB_KEY);
      initMap({
        elId: 'gmap',
        center: { lat: 12.3714, lng: -1.5197 },
        zoom: 13,
      });

      // Mock list (replace with your API)
      const list = [
        { id: 1, name: 'TD Automative', status: 'Active', zone: 'Ouaga North', pos: { lat: 12.3890, lng: -1.5090 } },
        { id: 2, name: 'TD Automative', status: 'Active', zone: 'Ouaga East', pos: { lat: 12.3655, lng: -1.5330 } },
        { id: 3, name: 'TD Automative', status: 'Busy', zone: 'Ouaga Central', pos: { lat: 12.3730, lng: -1.5000 } },
      ];

      const count = setGarages(list) || 0;
      $('#map-active-count').textContent = String(count);
      renderTable(list);
      fitAll();

      showMapDebug('✅ Map loaded. Click “View” to focus.');

      // Refresh
      $('#btn-refresh-map')?.addEventListener('click', () => {
        setGarages(list);
        $('#map-active-count').textContent = String(list.length);
        $('#map-last-sync').textContent = stampNow();
        showMapDebug('✅ Refreshed (mock).');
      });

      // Follow job
      $('#btn-open-job-follow')?.addEventListener('click', () => {
        showMapDebug('📍 Job tracking (mock).');
      });

      // Fit bounds
      $('#btn-fit-bounds')?.addEventListener('click', () => {
        fitAll();
        showMapDebug('🧲 Full view.');
      });

      // Clear focus
      $('#btn-clear-focus')?.addEventListener('click', () => {
        clearFocus();
        $('#map-focus-name').textContent = '—';
        fitAll();
        showMapDebug('✕ Selection reset.');
      });

      // Search
      $('#sp-search')?.addEventListener('input', (e) => {
        const filtered = applySearch(e.target.value);
        renderTable(filtered);
      });

    } catch (e) {
      err('❌ bootMapPage failed:', e);
      showMapDebug(
        '❌ Unable to load Google Maps.\n' +
        'Check: WEB key (Maps JavaScript API), billing enabled, HTTP referrer restrictions.'
      );
    }
  });
}

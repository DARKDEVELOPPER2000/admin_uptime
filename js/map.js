// js/map.js
let _google = null;
let _map = null;
let _markers = [];
let _garages = [];
let _info = null;
let _focusedId = null;

export function ensureGoogleMapsLoaded(key) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google);

    const id = 'gmaps-sdk';
    const existing = document.getElementById(id);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', reject);
      return;
    }

    const s = document.createElement('script');
    s.id = id;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error('Google Maps SDK load failed'));
    document.head.appendChild(s);
  });
}

export function initMap({ elId, center, zoom }) {
  _google = window.google;
  const el = document.getElementById(elId);
  if (!el) throw new Error(`#${elId} not found`);

  _map = new _google.maps.Map(el, {
    center,
    zoom,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: false,
    gestureHandling: 'greedy',
  });

  _info = new _google.maps.InfoWindow();
  return _map;
}

function clearMarkers() {
  _markers.forEach((m) => m.setMap(null));
  _markers = [];
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('active')) return 'ok';
  if (s.includes('busy') || s.includes('occup')) return 'warn';
  return 'soft';
}

function markerColor(status) {
  // Green = active, Dark = busy (fits your theme)
  const s = String(status || '').toLowerCase();
  if (s.includes('active')) return '#00FF40';
  return '#0f172a';
}

export function setGarages(list) {
  _garages = Array.isArray(list) ? list : [];
  if (!_map) return;

  clearMarkers();

  _garages.forEach((g) => {
    const pin = markerColor(g.status);

    const marker = new _google.maps.Marker({
      map: _map,
      position: g.pos,
      title: g.name,
      icon: {
        path: _google.maps.SymbolPath.CIRCLE,
        fillColor: pin,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8,
      },
    });

    marker.addListener('click', () => {
      focusGarage(g.id);
      _info.setContent(`
        <div style="font-family: ui-sans-serif, system-ui; font-weight:900;">
          <div style="font-size:13px">${g.name}</div>
          <div style="opacity:.7; font-weight:800; font-size:12px">${g.status || '—'}</div>
        </div>
      `);
      _info.open(_map, marker);
    });

    _markers.push(marker);
  });

  return _garages.length;
}

export function focusGarage(id) {
  if (!_map) return null;

  const g = _garages.find((x) => String(x.id) === String(id));
  if (!g) return null;

  _focusedId = g.id;
  _map.panTo(g.pos);
  _map.setZoom(Math.max(_map.getZoom(), 14));
  return g;
}

export function clearFocus() {
  _focusedId = null;
}

export function fitAll() {
  if (!_map || !_google || !_garages.length) return;

  const bounds = new _google.maps.LatLngBounds();
  _garages.forEach((g) => bounds.extend(g.pos));
  _map.fitBounds(bounds, 60);
}

export function getFocusedId() {
  return _focusedId;
}

export function getGarages() {
  return _garages.slice();
}

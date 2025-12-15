import { toast } from './utils.js';
import { go } from './router.js';

const $ = (s, r=document) => r.querySelector(s);

export function bindPage(hash){
  if (hash === '#/dashboard') bindDashboard();
  if (hash === '#/map') bindMap();
  if (hash === '#/job-follow') bindJobFollow();
  if (hash === '#/accounts-create') bindAccountsCreate();
  if (hash === '#/job-create') bindJobCreate();
  if (hash === '#/settings') bindSettings();
  if (hash === '#/login') bindLogin();

  // dashboard buttons with data-go
  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => go(btn.getAttribute('data-go')));
  });
}

function bindDashboard(){
  // mock refresh
}

function bindMap(){
  $('#btn-refresh-map')?.addEventListener('click', () => {
    toast('Map', 'Rafraîchi (mock).', 'ok');
    const n = 10 + Math.floor(Math.random()*10);
    const el = $('#map-active-count');
    if (el) el.textContent = String(n);
  });

  $('#btn-open-job-follow')?.addEventListener('click', () => go('#/job-follow'));

  document.querySelectorAll('[data-follow]').forEach(btn => {
    btn.addEventListener('click', () => {
      toast('Garagiste', 'Ouverture détail (mock).', 'ok');
      go('#/job-follow');
    });
  });
}

function bindJobFollow(){
  $('#btn-step-advance')?.addEventListener('click', () => {
    toast('Job', 'Étape avancée (mock).', 'ok');
  });

  $('#btn-cancel-job')?.addEventListener('click', () => {
    toast('Job', 'Job annulé (mock).', 'danger');
  });
}

function bindAccountsCreate(){
  $('#btn-generate-code')?.addEventListener('click', () => {
    const type = $('#acc-type')?.value || 'sp';
    const code = generateCode(type === 'sp' ? 'SP' : 'CL');
    const wrap = $('#generated-wrap');
    const out = $('#generated-code');
    if (wrap && out){
      out.textContent = code;
      wrap.hidden = false;
    }
    toast('Compte', `Compte créé + code: ${code} (mock)`, 'ok');
  });
}

function bindJobCreate(){
  const pv = () => {
    const service = $('#job-service')?.value || '—';
    const customer = $('#job-customer')?.value || '—';
    const pickup = $('#job-pickup')?.value || '—';
    const dest = $('#job-dest')?.value || '—';
    $('#pv-service').textContent = service;
    $('#pv-customer').textContent = `Client: ${customer}`;
    $('#pv-pickup').textContent = pickup;
    $('#pv-dest').textContent = dest;
  };

  ['job-service','job-customer','job-pickup','job-dest','job-note'].forEach(id => {
    $(`#${id}`)?.addEventListener('input', pv);
    $(`#${id}`)?.addEventListener('change', pv);
  });

  pv();

  $('#btn-create-job')?.addEventListener('click', () => {
    toast('Job', 'Job créé (mock).', 'ok');
    go('#/job-follow');
  });
}

function bindSettings(){
  // nothing
}

function bindLogin(){
  $('#btn-login')?.addEventListener('click', () => {
    toast('Connexion', 'Connecté (mock).', 'ok');
    go('#/dashboard');
  });
}

function generateCode(prefix){
  const n = Math.floor(100000 + Math.random()*900000);
  return `${prefix}-${n}`;
}

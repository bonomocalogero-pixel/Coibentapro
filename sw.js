/* Coibenta Pro – service worker (offline-first). Cambiare VERSIONE a ogni pubblicazione: il telefono avvisa "Nuova versione disponibile". */
const VERSIONE = 'coibenta-v141';
const FILE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(VERSIONE).then(c=> c.addAll(FILE))); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(k=> Promise.all(k.filter(x=> x !== VERSIONE).map(x=> caches.delete(x)))).then(()=> self.clients.claim())); });
self.addEventListener('message', e=>{ if(e.data === 'aggiorna') self.skipWaiting(); });
self.addEventListener('fetch', e=>{
  const r = e.request; if(r.method !== 'GET') return;
  const u = new URL(r.url);
  if(u.origin === location.origin){
    /* pagine e file dell'app: prima la copia sul telefono (si apre anche senza rete) */
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(c=> c || fetch(r).then(res=>{ if(res.ok){ const cp = res.clone(); caches.open(VERSIONE).then(x=> x.put(r, cp)); } return res; }).catch(()=> caches.match('./index.html'))));
  } else {
    /* librerie da CDN (Excel, lettura bolla): rete, e se c'è già una copia la usa quando manca il segnale */
    e.respondWith(fetch(r).then(res=>{ if(res.ok && /cdnjs|jsdelivr/.test(u.host)){ const cp = res.clone(); caches.open(VERSIONE + '-cdn').then(x=> x.put(r, cp)); } return res; }).catch(()=> caches.match(r)));
  }
});

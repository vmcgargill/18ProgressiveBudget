
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const iconSizes = ["192", "512"];
const iconFiles = iconSizes.map((size) => `/icons/icon-${size}x${size}.png`);

const staticFilesToPreCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/service-worker.js",
  "styles.css"
].concat(iconFiles);


// Install Cache
self.addEventListener("install", function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => {return cache.addAll(staticFilesToPreCache);}));
  self.skipWaiting();
});

// Activate Cache
self.addEventListener("activate", function(event) {
  event.waitUntil(caches.keys().then(keyList => {return Promise.all(keyList.map(key => {
  if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {return caches.delete(key);}}));}));
  self.clients.claim();
});

// Fetch Cache
self.addEventListener("fetch", function(event) {
  const {url} = event.request;
  if (url.includes("/api/transaction") || url.includes("/api/transaction/bulk")) {
    event.respondWith(caches.open(DATA_CACHE_NAME).then(cache => {return fetch(event.request).then(response => {
      if (response.status === 200) {cache.put(event.request, response.clone());}
      return response;}).catch(err => {return cache.match(event.request);});}).catch(err => console.log(err)));
  } else {
    event.respondWith(caches.open(CACHE_NAME).then(cache => {return cache.match(event.request).then(response => {return response || fetch(event.request);});}));
  }
});

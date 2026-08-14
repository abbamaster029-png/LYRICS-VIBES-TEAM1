const CACHE_NAME = "lvt-app-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./lvt-icon-512-1.png"
  "./New Project 99 [0AAD052].png"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(cacheNames => {

      return Promise.all(

        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))

      );

    }).then(() => {

      return self.clients.claim();

    })

  );

});


self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
      .then(response => {

        return response || fetch(event.request);

      })

  );

});
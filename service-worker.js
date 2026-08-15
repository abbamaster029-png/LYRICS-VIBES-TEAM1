const CACHE_NAME = "lvt-app-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./lvt-icon-512-1.png",
  "./New Project 99 [0AAD052].png"
];


/* ==============================
   INSTALL
============================== */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(FILES_TO_CACHE);

      })

  );

  self.skipWaiting();

});


/* ==============================
   ACTIVATE
============================== */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(cacheNames => {

      return Promise.all(

        cacheNames.map(cacheName => {

          if (cacheName !== CACHE_NAME) {

            return caches.delete(cacheName);

          }

        })

      );

    }).then(() => {

      return self.clients.claim();

    })

  );

});


/* ==============================
   FETCH
============================== */

self.addEventListener("fetch", event => {

  /*
     Domin sabon index.html ya rika fitowa
     maimakon tsohon cached version.
  */

  if (
    event.request.method === "GET" &&
    new URL(event.request.url).pathname.endsWith("/index.html")
  ) {

    event.respondWith(

      fetch(event.request)
        .then(response => {

          const responseClone = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                responseClone
              );

            });

          return response;

        })
        .catch(() => {

          return caches.match(
            event.request
          );

        })

    );

    return;

  }


  /*
     Sauran files:
     cache idan akwai,
     idan babu sai network.
  */

  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {

          return cachedResponse;

        }

        return fetch(event.request)
          .then(networkResponse => {

            return networkResponse;

          });

      })

      .catch(() => {

        return caches.match("./index.html");

      })

  );

});
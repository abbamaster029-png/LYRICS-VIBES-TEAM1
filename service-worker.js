const CACHE_NAME = "lvt-app-v5";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./about.html",
  "./apply.html",
  "./manifest.json",
  "./lvt-icon-192-2.png",
  "./lvt-icon-512-1.png",
  "./New Project 99 [0AAD052].png"
];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(FILES_TO_CACHE);

      })

  );

  self.skipWaiting();

});


/* =====================================================
   ACTIVATE
===================================================== */

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


/* =====================================================
   FETCH
===================================================== */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }


  const requestURL = new URL(event.request.url);


  /*
     HTML PAGES
     Network First:
     Sabon version ya fara zuwa.
     Idan babu internet, sai cached version.
  */

  if (
    event.request.destination === "document"
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

          return caches.match(event.request)
            .then(cachedResponse => {

              return cachedResponse ||
                     caches.match("./index.html");

            });

        })

    );

    return;

  }


  /*
     OTHER FILES
     Cache First:
     Idan file yana cache, amfani da shi.
     Idan babu, daga network.
  */

  event.respondWith(

    caches.match(event.request)

      .then(cachedResponse => {

        if (cachedResponse) {

          return cachedResponse;

        }


        return fetch(event.request)

          .then(networkResponse => {

            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type !== "opaque"
            ) {

              const responseClone =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    event.request,
                    responseClone
                  );

                });

            }

            return networkResponse;

          });

      })

      .catch(() => {

        return caches.match("./index.html");

      })

  );

});
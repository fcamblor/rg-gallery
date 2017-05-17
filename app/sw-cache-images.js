// this is the service worker which intercepts all http requests
this.addEventListener('fetch', function fetcher (event) {
    var request = event.request;
    // check if request
    if (request.url.indexOf('r-gounot.fr') > -1) {
        // contentful asset detected
        event.respondWith(
            caches.open('rg-pictures').then(function(cache) {
                return cache.match(event.request).then(function(response) {
                    // return from cache, otherwise fetch from network
                    if(response) {
                        console.info("Loaded asset from cache : "+request.url);
                        return response;
                    } else {
                        return fetch(request).then(function(response){
                            cache.put(event.request, response.clone());
                            console.info("Stored asset into cache : "+request.url);
                            return response;
                        });
                    }
                })
            })
        );
    }
    // otherwise: ignore event
});
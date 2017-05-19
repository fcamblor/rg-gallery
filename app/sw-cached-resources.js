// this is the service worker which intercepts all http requests
var isLocal = function(url){ return url.indexOf('localhost') !== -1; };
var isAsset = function(url){ return url[url.length-1]==='/' || url.indexOf('index.html') !== -1 || url.indexOf('scripts/') !== -1 || url.indexOf('styles/') !== -1 || url.indexOf('bower_components/') !== -1; };
var isPicture = function(url){ return url.indexOf('r-gounot.fr') !== -1 && !isAsset(url); };
var isSpreadsheet = function(url) { return url.indexOf('spreadsheets.google.com') !== -1; };

this.addEventListener('fetch', function fetcher (event) {
    var request = event.request;
    // check if request
    var isOuterUrlWithoutCORS = isSpreadsheet(request.url);
    if((isAsset(request.url) && !isLocal(request.url)) || isOuterUrlWithoutCORS) {
        // Asset detected : serving from network first, then falling back on cache if not available
        event.respondWith(
            caches.open('rg-assets').then(function(cache) {
                var fetchOpts = isOuterUrlWithoutCORS?{ mode: 'no-cors' }:undefined;
                return fetch(request, fetchOpts).then(function assetFetched(response) {
                    if(response && (response.ok || isOuterUrlWithoutCORS)) {
                        cache.put(request, response.clone());
                        console.info("Stored asset into cache : " + request.url);
                        return response;
                    } else {
                        console.info("Bad response from fetch, falling back on cache for : "+request.url);
                        return cache.match(request);
                    }
                }, function assetNotFetched() { // Here, good chances we're offline, serving from cache if found
                    return cache.match(request).then(function (response) {
                        if(response) {
                            console.info("Used cached assed for : "+request.url);
                        } else {
                            console.error("Asset neither available from network nor from cache : "+request.url);
                        }
                        return response;
                    })
                })
            })
        );
    }

    if(isPicture(request.url)) {
        // Picture detected : serving from cache first, then fallbacking on network if not in cache
        event.respondWith(
            caches.open('rg-pictures').then(function(cache) {
                return cache.match(request).then(function(response) {
                    // return from cache, otherwise fetch from network
                    if(response) {
                        console.info("Loaded asset from cache : "+request.url);
                        return response;
                    } else {
                        return fetch(request, { mode: 'no-cors' }).then(function(response){
                            if(response) {
                                cache.put(request, response.clone());
                                console.info("Stored picture into cache : "+request.url);
                            }
                            return response;
                        });
                    }
                })
            })
        );
    }
    // otherwise: ignore event
});
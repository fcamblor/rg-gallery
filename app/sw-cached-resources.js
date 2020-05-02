var _self = this;

var isLocal = function(url){ return url.indexOf('localhost') !== -1; };
var isAsset = function(url){ return url[url.length-1]==='/' || url.indexOf('index.html') !== -1 || url.indexOf('scripts/') !== -1 || url.indexOf('styles/') !== -1 || url.indexOf('bower_components/') !== -1; };
var isPicture = function(url){ return url.indexOf('r-gounot.fr') !== -1 && !isAsset(url); };
var isSpreadsheet = function(url) { return url.indexOf('spreadsheets.google.com') !== -1; };

var findResponseInCache = function(cache, request) {
    return cache.match(request).then(function (response) {
        if(response) {
            console.info("Used cached asset for : "+request.url);
        } else {
            console.error("Asset neither available from network nor from cache : "+request.url);
        }
        return response;
    }, function(error) {
        console.error("Error while matching request "+request.url+"in cache : "+error);
    });
};

var storeResponseInCache = function(what, cache, request, response) {
    return cache.put(request, response.clone()).then(function(){
        console.info("Stored "+what+" into cache : " + request.url);
        return response;
    }, function(error){
        console.error("Error while storing response for "+request.url+" : "+error);
        // Still returning initial response : if we face quota exceeded error, it shouldn't prevent
        // the asset to be fetched/returned
        return response;
    });
};

this.addEventListener('fetch', function fetcher (event) {
    var request = event.request;
    // check if request
    var isOuterUrlWithoutCORS = isSpreadsheet(request.url);
    if((isAsset(request.url) && !isLocal(request.url)) || isOuterUrlWithoutCORS) {
        // Asset detected : serving from network first, then falling back on cache if not available
        event.respondWith(
            caches.open('gall-assets').then(function(cache) {
                var fetchOpts = /*isOuterUrlWithoutCORS?{ mode: 'no-cors' }:*/undefined;
                return fetch(request, fetchOpts).then(function assetFetched(response) {
                    if(response /* && (response.ok || fetchOpts) */) {
                        return storeResponseInCache("asset", cache, request, response);
                    } else {
                        console.info("Bad response from fetch, falling back on cache for : "+request.url);
                        return findResponseInCache(cache, request);
                    }
                }, function assetNotFetched() { // Here, good chances we're offline, serving from cache if found
                    return findResponseInCache(cache, request);
                })
            })
        );
    }

    if(isPicture(request.url)) {
        // Picture detected : serving from cache first, then fallbacking on network if not in cache
        event.respondWith(
            caches.open('gall-pictures').then(function(cache) {
                return cache.match(request).then(function(response) {
                    // return from cache, otherwise fetch from network
                    if(response) {
                        console.info("Loaded asset from cache : "+request.url);
                        return response;
                    } else {
                        return fetch(request, { mode: 'no-cors' }).then(function(response){
                            if(response) {
                                return storeResponseInCache("picture", cache, request, response);
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

_self.addEventListener('message', function handler (event) {
    if(event.data.action === 'invalidate-preloaded-pictures') {
        caches.open('gall-pictures')
            .then(cache => {
                cache.keys().then(cacheKeys => {
                    let deletedPictures = [];
                    for(const request of cacheKeys) {
                        if(event.data.pictureUrlsToInvalidate.indexOf(request.url) !== -1) {
                            cache.delete(request);
                            deletedPictures.push(request.url);
                        }
                    }

                    console.log(deletedPictures.length+" pictures have been removed from cache !");
                    event.ports[0].postMessage({ deletedPictures });
                });
            });
    }
});


// Essentially we don't want to require the user to refresh the page for the service worker to begin — we want
// the service worker to activate upon initial page load.
_self.addEventListener('activate', function(event) {
    // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
    event.waitUntil(_self.clients.claim());
});

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

import {PicturesLoader} from './components/PicturesLoader';
import {PicturesGallery} from './components/PicturesGallery';
import {DrawingItem} from './components/DrawingItem';

let getParameterByName = (name: string) => {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// register service worker
if ('serviceWorker' in navigator) {
    // Unregistering old sw-cache-images service worker and/or ALL service workers if forceResetSW query param is provided
    let forceResetSW = getParameterByName("forceResetSW");
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        _.each(registrations, (registration) => {
            let swUrl = _.get(registration, 'active.scriptURL', '');
            if(swUrl.indexOf('sw-cache-images') !== -1 || forceResetSW) {
                registration.unregister().then(function(register){
                    console.info("Old service worker unregistered successfully : "+swUrl);
                    alert("Old service worker unregistered successfully : "+swUrl);
                }, function(error){
                    console.error("Old service worker unregistration failed "+swUrl+" : "+error);
                    alert("Error during old service worker unregistration "+swUrl+" : "+error);
                });
            }
        });
    });

    navigator.serviceWorker.register($("head base").attr('href')+'sw-cached-resources.js', { scope: $("head base").attr('href') })
        .then((reg) => console.log('SW Registration succeeded. Scope is ' + reg.scope))
        .catch((error, ...args) => console.error('Error when registering service worker', error, args));

    // Listen for claiming of our ServiceWorker
    navigator.serviceWorker.addEventListener('controllerchange', function(event) {
        // Listen for changes in the state of our ServiceWorker, triggered by SW's activate event
        navigator.serviceWorker.controller.addEventListener('statechange', function() {
            // If the ServiceWorker becomes "activated", let the user know the page will reload...
            if (this.state === 'activated') {
                alert("Detected Service worker update... reloading the page to take it into consideration...");
                document.location.reload(true);
            }
        });
    });
}

let picturesLoader = new PicturesLoader();
picturesLoader.load().then(() => {
    var drawings = _.map(picturesLoader.loadedDrawings(), (drawing) => new DrawingItem(drawing));

    new PicturesGallery($("#gallery")).fillWith(drawings);
});


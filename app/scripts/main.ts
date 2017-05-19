import {PicturesLoader} from './components/PicturesLoader';
import {PicturesGallery} from './components/PicturesGallery';
import {DrawingItem} from './components/DrawingItem';


// register service worker
if ('serviceWorker' in navigator) {
    // Unregistering old sw-cache-images service worker
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        _.each(registrations, (registration) => {
            if(_.get(registration, 'active.scriptURL', '').indexOf('sw-cache-images') !== -1) {
                registration.unregister().then(function(register){
                    console.info("Old service worker unregistered successfully : "+register);
                }, function(error){
                    console.error("Old service worker unregistration failed : "+error);
                });
            }
        });
    });

    navigator.serviceWorker.register($("head base").attr('href')+'sw-cached-resources.js', { scope: $("head base").attr('href') })
        .then((reg) => console.log('SW Registration succeeded. Scope is ' + reg.scope))
        .catch((error, ...args) => console.error('Error when registering service worker', error, args));
}

let picturesLoader = new PicturesLoader();
picturesLoader.load().then(() => {
    var drawings = _.map(picturesLoader.loadedDrawings(), (drawing) => new DrawingItem(drawing));

    new PicturesGallery($("#gallery")).fillWith(drawings);
});


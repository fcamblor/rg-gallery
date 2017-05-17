import {PhotoSwipeComponent} from './components/PhotoSwipeComponent';
import {PicturesLoader} from './components/PicturesLoader';
import {PicturesGallery} from './components/PicturesGallery';


// register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw-cache-images.js', { scope: './' })
        .then((reg) => console.log('SW Registration succeeded. Scope is ' + reg.scope))
        .catch((error, ...args) => console.error('Error when registering service worker', error, args));
}

let picturesLoader = new PicturesLoader();
picturesLoader.load().then(() => {
    var drawings = picturesLoader.loadedDrawings();

    new PicturesGallery($("#gallery")).fillWith(drawings);
});


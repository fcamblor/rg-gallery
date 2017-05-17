import {PhotoSwipeComponent} from './components/PhotoSwipeComponent';
import {PicturesLoader} from './components/PicturesLoader';
import {PicturesGallery} from './components/PicturesGallery';



let picturesLoader = new PicturesLoader();
picturesLoader.load().then(() => {
    var drawings = picturesLoader.loadedDrawings();

    new PicturesGallery($("#gallery")).fillWith(drawings);
});


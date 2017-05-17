

import {PHOTO_SWIPE_HTML} from './PhotoSwipeHTML';
import {PicturesLoader} from './PicturesLoader';
export class PhotoSwipeComponent {


    constructor(private $el: JQuery) {
    }

    init(){
        this.$el.html(PHOTO_SWIPE_HTML);

        let picturesLoader = new PicturesLoader();
        picturesLoader.load().then(() => {
            var drawings = picturesLoader.loadedDrawings();
            new PhotoSwipe(this.$el.find(".pswp").get(0), PhotoSwipeUI_Default,
                _.map(drawings, (drawing) => {
                    return { src: drawing.picture, w: drawing.width, h: drawing.height };
                }),
                { index: 0 }
            ).init();
        });
    }
}


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
                    if(drawing.picture1) {
                        return { src: drawing.picture1, w: drawing.picture1Width, h: drawing.picture1Height };
                    } else {
                        return { src: drawing.picture2, w: drawing.picture2Width, h: drawing.picture2Height };
                    }
                }),
                { index: 0 }
            ).init();
        });
    }
}
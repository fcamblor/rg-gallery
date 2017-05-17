

import {PHOTO_SWIPE_HTML} from './PhotoSwipeHTML';
import {Drawing, PicturesLoader} from './PicturesLoader';
export class PhotoSwipeComponent {


    constructor(private $el: JQuery, private drawings: Drawing[]) {
        this.$el.html(PHOTO_SWIPE_HTML);
    }

    open(options: PhotoSwipe.Options){
        new PhotoSwipe(this.$el.find(".pswp").get(0), PhotoSwipeUI_Default,
            _.map(this.drawings, (drawing) => {
                return { src: drawing.picture, w: drawing.width, h: drawing.height };
            }),
            options
        ).init();
    }
}


import {PHOTO_SWIPE_HTML} from './PhotoSwipeHTML';
export class PhotoSwipeComponent {


    constructor(private $el: JQuery) {
    }

    init(){
        this.$el.html(PHOTO_SWIPE_HTML);
        new PhotoSwipe(this.$el.find(".pswp").get(0), PhotoSwipeUI_Default, [
            {
                src: 'https://placekitten.com/600/400',
                w: 600,
                h: 400
            },
            {
                src: 'https://placekitten.com/1200/900',
                w: 1200,
                h: 900
            }
        ], { index: 0 }).init();
    }
}
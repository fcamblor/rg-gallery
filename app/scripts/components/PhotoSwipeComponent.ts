import {PHOTO_SWIPE_HTML} from './PhotoSwipeHTML';
import {Drawing, PicturesLoader} from './PicturesLoader';

interface DrawingItem extends PhotoSwipe.Item {
    type: string;
}

export class PhotoSwipeComponent {

    private photoSwipe: PhotoSwipe<PhotoSwipeUI_Default.Options>;

    constructor(private $el: JQuery, private drawings: Drawing[]) {
        this.$el.html(PHOTO_SWIPE_HTML);
    }

    open(options: PhotoSwipe.Options){
        this.photoSwipe = new PhotoSwipe(this.$el.find(".pswp").get(0), PhotoSwipeUI_Default,
            _.map<Drawing, DrawingItem>(this.drawings, (drawing, index) => {
                return { src: drawing.picture, w: drawing.width, h: drawing.height, title: `#${drawing.id} ${drawing.title}`, type: drawing.type };
            }),
            options
        );
        this.photoSwipe.init();
    }

    destroy() {
        if(this.photoSwipe) {
            this.photoSwipe.destroy();
            this.photoSwipe = null;
        }
    }
}
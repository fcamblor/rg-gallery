import {PHOTO_SWIPE_HTML} from './PhotoSwipeHTML';
import {Drawing, PicturesLoader} from './PicturesLoader';

interface DrawingItem extends PhotoSwipe.Item {
    type: string;
    tags: string[];
}

interface Binding {
    attr: string;
    selector: string;
    elAttribute?: 'text'|'html';
    converter?: (val: any) => string;
}

export class PhotoSwipeComponent {

    private photoSwipe: PhotoSwipe<PhotoSwipeUI_Default.Options>;

    constructor(private $el: JQuery, private drawings: Drawing[]) {
        this.$el.html(PHOTO_SWIPE_HTML);
    }

    open(options: PhotoSwipe.Options){
        this.photoSwipe = new PhotoSwipe(this.$el.find(".pswp").get(0), PhotoSwipeUI_Default,
            _.map<Drawing, DrawingItem>(this.drawings, (drawing, index) => {
                return { src: drawing.picture, w: drawing.width, h: drawing.height, title: `#${drawing.id} ${drawing.title}`, type: drawing.type, tags: drawing.tags };
            }),
            options
        );
        this.photoSwipe.init();

        this.photoSwipe.listen('afterChange', () => {
            this.showDetailsFor(<DrawingItem>this.photoSwipe.currItem);
        });
        this.showDetailsFor(<DrawingItem>this.photoSwipe.currItem);

        this.$el.find(".pswp .pswp__button--info").click((event) => {
            this.$el.find(".pswp__scroll-wrap").toggleClass("with-details");
        });
    }

    showDetailsFor(drawing: DrawingItem) {
        let $container = $((<any>this.photoSwipe).scrollWrap);
        _.each([
            { attr: 'type', selector: '.drawing_type', elAttribute: 'text' },
            { attr: 'tags', selector: '.drawing_tags', elAttribute: 'html', converter: (tags: string[]) => _.map(tags, (tag) => `<div class="tag">${tag}</div>`).join("") }
        ], (binding: Binding) => {
            let $el = $container.find(binding.selector);
            let val = drawing[binding.attr];
            if(binding.converter) {
                val = binding.converter(val);
            }
            switch(binding.elAttribute) {
                case 'text': $el.text(val); break;
                case 'html': $el.html(val); break;
                default: $el.val(val); break;
            }
        });
    }

    destroy() {
        if(this.photoSwipe) {
            this.$el.find(".pswp .pswp__button--info").off('click');
            this.photoSwipe.destroy();
            this.photoSwipe = null;
        }
    }
}
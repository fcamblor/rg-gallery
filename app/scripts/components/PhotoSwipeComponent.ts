import {PHOTO_SWIPE_HTML} from './PhotoSwipeHTML';
import {DrawingItem} from './DrawingItem';

interface Binding {
    attr: string;
    selector: string;
    elAttribute?: 'text'|'html';
    converter?: (val: any) => string;
}

export class PhotoSwipeComponent {

    private photoSwipe: PhotoSwipe<PhotoSwipeUI_Default.Options>;

    constructor(private $el: JQuery, private drawings: DrawingItem[]) {
        this.$el.html(PHOTO_SWIPE_HTML);
    }

    open(options: PhotoSwipe.Options){
        this.photoSwipe = new PhotoSwipe(this.$el.find(".pswp").get(0), PhotoSwipeUI_Default,
            this.drawings,
            options
        );
        this.photoSwipe.init();

        this.photoSwipe.listen('afterChange', () => {
            this.showDetailsFor(<DrawingItem>this.photoSwipe.currItem);
        });
        // Better listen on photoSwipe's destroy event than make this stuff in this.destroy()
        // as I guess this.photoSwipe.destroy() will be called when we close photoswipe (whereas
        // this.destroy() won't at that time)
        this.photoSwipe.listen('destroy', () => {
            this.$el.find(".pswp .pswp__button--info").off('click');
            this.photoSwipe = null;
        });
        this.showDetailsFor(<DrawingItem>this.photoSwipe.currItem);

        this.$el.find(".pswp .pswp__button--info").click((event) => {
            this.$el.find(".pswp__scroll-wrap").toggleClass("with-details");
        });
    }

    showDetailsFor(drawing: DrawingItem) {
        let $container = $((<any>this.photoSwipe).scrollWrap);
        _.each([
            { attr: 'id', selector: '.drawing_id', elAttribute: 'text' },
            { attr: 'shortTitle', selector: '.drawing_shortTitle', elAttribute: 'text' },
            { attr: 'category', selector: '.drawing_category', elAttribute: 'text' },
            { attr: 'type', selector: '.drawing_type', elAttribute: 'text' },
            { attr: 'date', selector: '.drawing_date', elAttribute: 'text' },
            { attr: 'signature', selector: '.drawing_signature', elAttribute: 'text' },
            { attr: 'dimensions', selector: '.drawing_dimensions', elAttribute: 'text' },
            { attr: 'lastHolder', selector: '.drawing_lastHolder', elAttribute: 'text' },
            { attr: 'localization', selector: '.drawing_localization', elAttribute: 'text' },
            { attr: 'src', selector: '.drawing_filename', elAttribute: 'text', converter: (src: string) => _.last(src.split("/")) },
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
            this.photoSwipe.destroy();
        }
    }
}
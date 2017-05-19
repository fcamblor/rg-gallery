

import {PhotoSwipeComponent} from "./PhotoSwipeComponent";
import {DrawingItem} from './DrawingItem';

export class PicturesGallery {
    private drawings: DrawingItem[];
    constructor(private $el: JQuery) {
    }

    fillWith(drawings: DrawingItem[]){
        this.drawings = drawings;

        $(_.map(drawings, (drawing, index) => {
            let orientation = drawing.w>drawing.h?'landscape':'portrait';
            let style = '';
            if(orientation === 'landscape') {
                style = 'padding-top:'+((100-(100*drawing.h/drawing.w))/2)+'%';
            } else {
                style = 'padding-left:'+((100-(100*drawing.w/drawing.h))/2)+'%';
            }
            return `
                <div class="box">
                  <div class="boxInner ${orientation}" style="${style}" data-size="${drawing.w}x${drawing.h}">
                    <img src="${drawing.src}" data-img-index="${index}"/>
                    <div class="titleBox">#${drawing.title}</div>
                  </div>
                </div>
            `;
        }).concat(`<div class="photoswipe"></div>`).join("\n")).appendTo(this.$el);

        // Add the touch toggle to show text when tapped
        if ('ontouchstart' in window) {
            this.$el.find('div.boxInner img').click(function() {
                $(this).closest('.boxInner').toggleClass('touchFocus');
            });
        }

        this.$el.find('img').click((event) => this.openPhotoSwipe(Number($(event.currentTarget).attr('data-img-index'))));
    }

    openPhotoSwipe(imgIndex: number) {
        new PhotoSwipeComponent(this.$el.find('.photoswipe'), this.drawings).open({
            index: imgIndex
        });
    }
}

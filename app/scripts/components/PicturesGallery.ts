

import {Drawing} from './PicturesLoader';
import {PhotoSwipeComponent} from "./PhotoSwipeComponent";

export class PicturesGallery {
    private drawings: Drawing[];
    constructor(private $el: JQuery) {
    }

    fillWith(drawings: Drawing[]){
        this.drawings = drawings;

        $(_.map(drawings, (drawing, index) => {
            let orientation = drawing.width>drawing.height?'landscape':'portrait';
            let style = '';
            if(orientation === 'landscape') {
                style = 'padding-top:'+((100-(100*drawing.height/drawing.width))/2)+'%';
            } else {
                style = 'padding-left:'+((100-(100*drawing.width/drawing.height))/2)+'%';
            }
            return `
                <div class="box">
                  <div class="boxInner ${orientation}" style="${style}" data-size="${drawing.width}x${drawing.height}">
                    <img src="${drawing.picture}" data-img-index="${index}"/>
                    <div class="titleBox">#${drawing.id} ${drawing.title}</div>
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

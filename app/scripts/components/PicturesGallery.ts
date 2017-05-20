

import {PhotoSwipeComponent} from "./PhotoSwipeComponent";
import {DrawingItem} from './DrawingItem';

class FilteredDrawingItem extends DrawingItem {
    constructor(drawingItem: DrawingItem, public initialListIndex: number) {
        super();
        _.extend(this, drawingItem);
    }
}

export class PicturesGallery {
    private drawings: DrawingItem[];
    private filteredDrawings: FilteredDrawingItem[];

    constructor(private $el: JQuery) {
    }

    fillWith(drawings: DrawingItem[]){
        this.drawings = drawings;
        this.filteredDrawings = _.map(drawings, (drawing, index) => new FilteredDrawingItem(drawing, index));

        let searchCriteriaNames: string[] = _(drawings)
            .map((drawing) => drawing.qualifiers)
            .flatten()
            .map((qualifier: string) => qualifier.split(":")[0]+":*")
            .uniq()
            .value();

        $(_([])
            .concat(`<div>Critères de recherche: ${searchCriteriaNames.join(", ")}</div>`)
            .concat(`<select class="searchCriteria" style="width: 100%" multiple="true" data-placeholder="Critres de recherche"></select>`)
            .concat(`<hr/>`)
            .concat(`<div class="pictures">`)
            .concat(_.map(drawings, (drawing, index) => {
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
            }))
            .concat(`</div>`)
            .concat(`<div class="photoswipe"></div>`)
            .join("\n")
        ).appendTo(this.$el);

        this.$el.find(".searchCriteria").chosen({
        }).change(() => this.refreshDisplayedPictures());

        this.fillSearchCriteria();

        // Add the touch toggle to show text when tapped
        if ('ontouchstart' in window) {
            this.$el.find('div.boxInner img').click(function() {
                $(this).closest('.boxInner').toggleClass('touchFocus');
            });
        }

        this.$el.find('img').click((event) => this.openPhotoSwipe(Number($(event.currentTarget).attr('data-img-index'))));
    }

    fillSearchCriteria() {
        let countableQualifiers: {qualifier: string, count: number}[] = _(this.filteredDrawings)
            .map((drawing) => drawing.qualifiers)
            .flatten()
            .countBy()
            .map((count, qualifier) => { return { count, qualifier}; })
            .sortBy('qualifier')
            .value();

        let $searchCriteria = this.$el.find(".searchCriteria");
        let oldValues = $searchCriteria.val();
        $searchCriteria.empty();
        $(_.map(countableQualifiers, (cq) => `<option value="${cq.qualifier}">${cq.qualifier} (${cq.count})</option>`).join("\n")).appendTo($searchCriteria);
        $searchCriteria.val(oldValues);
        $searchCriteria.trigger("chosen:updated");
    }

    refreshDisplayedPictures() {
        let previousFilteredDrawingIndexes: number[] = _.pluck(this.filteredDrawings, "initialListIndex");

        let searchCriteria = $(".searchCriteria").val();

        this.filteredDrawings = [];
        let showSelectors = [], hideSelectors = [];
        _.each(this.drawings, (drawing, index) => {
            let eligible = _.reduce(searchCriteria, (result, criteria: string) => result && drawing.qualifiers.indexOf(criteria) !== -1, true);
            let selector = `.pictures .box:nth-child(${index+1})`;
            if(eligible) {
                this.filteredDrawings.push(new FilteredDrawingItem(drawing, index));
                // If drawing is not filtered anymore, we should show the picture
                if(previousFilteredDrawingIndexes.indexOf(index) === -1) {
                    showSelectors.push(selector);
                }
            } else {
                // if drawing was filtered, we should hide the picture
                if(previousFilteredDrawingIndexes.indexOf(index) !== -1) {
                    hideSelectors.push(selector);
                }
            }
        });

        console.log("Number of els to show="+showSelectors.length+", to hide="+hideSelectors.length);
        if(showSelectors.length) {
            let $elsToShow = this.$el.find(showSelectors.join(","));
            $elsToShow.removeClass("hidden");
            setTimeout(() => {
                $elsToShow.removeClass('visuallyhidden');
            }, 20);
        }

        if(hideSelectors.length) {
            let $elsToHide = this.$el.find(hideSelectors.join(","));
            $elsToHide.addClass("visuallyhidden");
            $(hideSelectors[0]).one('transitionend', () => {
                console.log("End of transition !");
                $elsToHide.addClass('hidden');
            });
        }

        this.fillSearchCriteria();
    }

    openPhotoSwipe(imgIndex: number) {
        let index = _.findIndex(this.filteredDrawings, (filteredDrawing) => imgIndex == filteredDrawing.initialListIndex);
        new PhotoSwipeComponent(this.$el.find('.photoswipe'), this.filteredDrawings).open({
            index
        });
    }
}

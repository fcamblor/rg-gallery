import {PhotoSwipeComponent} from "./PhotoSwipeComponent";
import {DrawingItem} from './DrawingItem';
import {PictureIds, Store} from './Store';

declare var Q: any;

class FilteredDrawingItem extends DrawingItem {
    constructor(drawingItem: DrawingItem, public initialListIndex: number) {
        super();
        _.extend(this, drawingItem);
    }
}

type LoadingPictureResult = {result: "ok"|"error", pictureUrl: string};

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
            .concat(`<div id="top-section">
                        <div id="hello-section"></div>
                        <div id="preload-pictures-section"></div>
                        <div id="invalidate-preload-pictures-section"></div>
                        <div id="duplicate-ids-section" style="color: red"></div>
                        <hr/>
                     </div>`)
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
                        <img src="${drawing.msrc}" data-img-index="${index}"/>
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

        this.initUser();
        this.initDuplicateIds();
        this.initPreloadedPictures();
    }

    initUser() {

    }

    initPreloadedPictures() {
        this._preloadablePicturesIds().then((results) => {
            if(results.preloadablePictureIds.length) {
                this.$el.find("#preload-pictures-section").html(`${results.preloadablePictureIds.length} oeuvre(s) pourrai(en)t être chargée(s) en cache pour ensuite être visible(s) hors ligne (attention, cela peut consommer beaucoup de data). <button id="preload-pictures-btn">Précharger</button>`);
                this.$el.find("#preload-pictures-btn").on('click', () => this.preloadPictures());
            }
            if(results.preloadedPictureIds.length) {
                this.$el.find("#invalidate-preload-pictures-section").html(`${results.preloadedPictureIds.length} oeuvre(s) peu(ven)t être supprimée(s) du cache hors ligne. <button id="invalidate-preload-pictures-btn">Invalider le cache</button>`);
                this.$el.find("#invalidate-preload-pictures-btn").on('click', () => this.invalidatePreloadedPictures());
            }
        });
    }

    private _preloadablePicturesIds(): Promise<{preloadablePictureIds: PictureIds, preloadedPictureIds: PictureIds}> {
        return Store.INSTANCE.loadPreloadedPictures().then((_preloadedPictures: PictureIds) => {
            let preloadedPictureIds = _preloadedPictures || [];
            return {
                preloadablePictureIds:_(this.drawings).pluck<string>("id").filter((pictureId: string) => preloadedPictureIds.indexOf(pictureId) === -1).value(),
                preloadedPictureIds
            };
        });
    }

    private _sendServiceWorkerMessage(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = function(event) {
                if (event.data.error) {
                    reject(event.data.error);
                } else {
                    resolve(event.data);
                }
            };
            navigator.serviceWorker.controller.postMessage(data, [messageChannel.port2]);
        });
    }

    invalidatePreloadedPictures() {
        Store.INSTANCE.loadPreloadedPictures().then(preloadedPictureIds => {
            const drawingsById = _.indexBy(this.drawings, drawing => drawing.id);
            const pictureUrlsToInvalidate = _.map(preloadedPictureIds, pictureId => drawingsById[pictureId].src);

            this._sendServiceWorkerMessage({'action':'invalidate-preloaded-pictures', pictureUrlsToInvalidate }).then((result) => {
                alert(`${result.deletedPictures.length} oeuvre(s) ont été supprimée(s) du cache hors ligne !`);

                Store.INSTANCE.resetPreloadedPictures()
                    // Refreshing page
                    .then(() => window.location.reload(true));
            });
        });
    }

    preloadPictures() {
        let $btn = this.$el.find("#preload-pictures-btn");
        let picturesById: {[id:string]: DrawingItem } = _(this.drawings).groupBy('id').mapValues(drawings => drawings[0]).value();
        this._preloadablePicturesIds().then((results) => {
            let preloadedPictures = results.preloadedPictureIds, preloadingPictureErrors = [];
            let intervalId = setInterval(() => {
                $btn.text(`Chargement ${preloadedPictures.length + preloadingPictureErrors.length}/${results.preloadablePictureIds.length}...`);
                Store.INSTANCE.savePreloadedPictures(preloadedPictures);
            }, 1000);

            _(results.preloadablePictureIds).chunk(5).reduce((previousPromise: Promise<any>, pictureIds: PictureIds) => {
                return previousPromise.then(() => {
                    return Q.all(_.map(pictureIds, (pictureId) => {
                        return this._loadPictureURL(picturesById[pictureId].src).then((res) => {
                            if(res.result === 'ok') {
                                preloadedPictures.push(pictureId);
                            } else /* if(res.result === 'error') */ {
                                preloadingPictureErrors.push(pictureId);
                            }
                            return null;
                        });
                    }));
                });
            }, Q.resolve(null)).then(function(){
                console.log("Finished pre-loading everything !");
                clearInterval(intervalId);
                return Store.INSTANCE.savePreloadedPictures(preloadedPictures);
            }).then(() => {
                this.$el.find("#preload-pictures-section").hide();
            });
        });
    }

    private _loadPictureURL(pictureUrl: string): Promise<LoadingPictureResult> {
        var defer = Q.defer();

        let isResolved = false;
        var img = new Image();
        img.onload = function() {
            defer.resolve({result: "ok", pictureUrl });
            isResolved = true;
        };
        img.onerror = function(){
            console.error("Error loading image url : "+pictureUrl);
            isResolved = true;
            defer.resolve({result: "error", pictureUrl });
        };
        img.src = pictureUrl;
        setTimeout(function(){
            if(!isResolved) {
                console.info("Forced error for image url : "+pictureUrl);
                defer.resolve({ result: "error", pictureUrl });
            }
        }, 10000);

        return defer.promise;
    }

    initDuplicateIds() {
        let duplicateIds: {id: string, count: number}[] = _(this.drawings)
            .countBy('id')
            .map((count, id) => { return {id, count}; })
            .filter((item) => item.count > 1)
            .value();

        if(duplicateIds.length) {
            this.$el.find("#duplicate-ids-section").html(`Des identifiants en doublon ont été détectés : ${_.map(duplicateIds, (item) => `${item.id} (${item.count})`).join(", ")}`);
        }
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

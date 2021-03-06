
export const PHOTO_SWIPE_HTML = `
    <!-- Root element of PhotoSwipe. Must have class pswp. -->
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">

    <!-- Background of PhotoSwipe. 
         It's a separate element as animating opacity is faster than rgba(). -->
    <div class="pswp__bg"></div>

    <!-- Slides wrapper with overflow:hidden. -->
    <div class="pswp__scroll-wrap">

        <!-- Container that holds slides. 
            PhotoSwipe keeps only 3 of them in the DOM to save memory.
            Don't modify these 3 pswp__item elements, data is added later on. -->
        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>
        
        <div class="details">
            <div>
                <label>ID</label> : <div class="tag drawing_id"></div>
            </div>
            <div>
                <label>Titre</label> : <div class="tag drawing_shortTitle"></div>
            </div>
            <div>
                <label>Catégorie</label> : <div class="tag drawing_category"></div>
            </div>
            <div>
                <label>Type</label> : <div class="tag drawing_type"></div>
            </div>
            <div>
                <label>Dernier détenteur</label> : <div class="tag drawing_lastHolder"></div>
            </div>
            <div>
                <label>Localisation</label> : <div class="tag drawing_localization"></div>
            </div>
            <div>
                <label>Date</label> : <div class="tag drawing_date"></div>
            </div>
            <div>
                <label>Signature</label> : <div class="tag drawing_signature"></div>
            </div>
            <div>
                <label>Dimensions (en cm)</label> : <div class="inline drawing_dimensions"></div>
            </div>
            <div>
                <label>Nom fichier</label> : <div class="inline drawing_filename"></div>
            </div>
            <div>
                <label>Mots-clefs</label> : <div class="multiple-tags drawing_tags"></div>
            </div>
        </div>

        <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
        <div class="pswp__ui pswp__ui--hidden">

            <div class="pswp__top-bar">

                <!--  Controls are self-explanatory. Order can be changed. -->

                <div class="pswp__counter"></div>
                <i class="custom-icon-button icon-cancel pswp__button--close"></i>
                <i class="custom-icon-button icon-export pswp__button--share"></i>
                <i class="custom-icon-button icon-info-circled pswp__button--info"></i>
                <i class="custom-icon-button icon-camera pswp__button--photo"></i>
                <span class="resize-full-section"><i class="custom-icon-button icon-resize-full pswp__button--fs"></i></span>
                <span class="resize-small-section"><i class="custom-icon-button icon-resize-small pswp__button--fs"></i></span>
                <span class="zoom-in-section"><i class="custom-icon-button icon-zoom-in pswp__button--zoom"></i></span>
                <span class="zoom-out-section"><i class="custom-icon-button icon-zoom-out pswp__button--zoom"></i></span>

                <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->
                <!-- element will get class pswp__preloader--active when preloader is running -->
                <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                      </div>
                    </div>
                </div>
            </div>

            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div class="pswp__share-tooltip"></div> 
            </div>

            <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
            </button>

            <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
            </button>

            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>

        </div>

    </div>

</div>
    `;
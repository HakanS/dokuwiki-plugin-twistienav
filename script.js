/**
 * AJAX functions for the pagename quicksearch
 *
 * @license  GPL2 (http://www.gnu.org/licenses/gpl.html)
 * @author   Håkan Sandell <sandell.hakan@gmail.com>
 */

var twistienav_plugin = {

    $callerObj: null,

    /**
     * Add twisties and link events 
     */
    init: function () {
        var do_search;
        var $traceObj = jQuery('div.youarehere');

        if ($traceObj.length === 0) {
            // try second breadcrumb instead
            $traceObj = jQuery('div.breadcrumbs').not(':has(span.bcsep)');
            if ($traceObj.length === 0) {
                return;
            }
        }

        jQuery(document).click(function(e) {
            twistienav_plugin.clear_results();
        });
        
        do_search = function (caller, namespace) {
            twistienav_plugin.$callerObj = jQuery(caller);
            jQuery.post(
                DOKU_BASE + 'lib/exe/ajax.php',
                {
                    call: 'plugin_twistienav',
                    idx: encodeURI(namespace)
                },
                twistienav_plugin.onCompletion,
                'html'
            );
        };

        // remove all '»' (might not work in special templates) and remove current id highlight
        trace = $traceObj.html();
        trace = trace.replace(/<span class="curid">/gi,'')
                     .replace(/<\/span>$/gi,'')
                     .replace(/>\s.\s</gi,'><');
        $traceObj.html(trace);

        // add new twisties
        var linkNo;
        $links = $traceObj.find('a');
        $links.each(function () {
            var ns;
            var pagename;

            linkNo++;
            ns = jQuery(this).attr('href');
            ns = ns.substr(ns.indexOf('=') + 1);   // TODO - does not work with URL re-rewrite
            
            pagename = ns.substr(ns.lastIndexOf(':') + 1);
            ns = ns.substr(0, ns.lastIndexOf(':'));

            // hide last twistie if current id is not a namespace start page
            if (linkNo == 1 || pagename == 'start') {
                jQuery(document.createElement('span'))
                                .addClass('twistienav_twistie')
                                .show()
                                .insertAfter(this)
                                .click(function() {
                                    twistie_active = jQuery(this).hasClass('twistienav_down'); 
                                    twistienav_plugin.clear_results();
                                    if (!twistie_active) {
                                        do_search(this, ns);
                                    }
                                });
            }
        });
    },

    /**
     * Remove output div
     */
    clear_results: function(){
        jQuery('.twistienav_twistie').removeClass('twistienav_down');
        jQuery('#twistienav__popup').remove();
    },

    /**
     * Callback. Reformat and display the results.
     *
     * Namespaces are shortened here to keep the results from overflowing
     * or wrapping
     *
     * @param data The result HTML
     */
    onCompletion: function(data) {
        var pos = twistienav_plugin.$callerObj.position();

        if (data === '') { return; }

        twistienav_plugin.$callerObj.addClass('twistienav_down');

        jQuery(document.createElement('div'))
                        .html(data)
                        .attr('id','twistienav__popup')
                        .css({
                            'position':    'absolute',
                            'top':         (pos.top +16)+'px',
                            'left':        (pos.left+16)+'px'
                            })
                        .show()
                        .insertAfter(twistienav_plugin.$callerObj)
                        .click(function() {
                            twistienav_plugin.clear_results();
                        });
    }
};

jQuery(function () {
    twistienav_plugin.init();
});

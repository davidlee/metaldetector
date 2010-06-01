//

(function($) {
    var input, collection, options;


    var defaults = {
        text: function(el) { return $(el).text(); }
    };


    var hasLogger = typeof console != 'undefined' && typeof console.log == 'function';
    $.extend({
        log: function() {
            if (hasLogger) {
                console.log.apply(console, $.makeArray(arguments));
            } else {
                alert.apply(window, $.makeArray(arguments));
            };
        }
    });

    function log() {
        if (options.debug) $.log(arguments);
    };


    function sortByScore(a, b) {
        return $(b).data('md.score') - $(a).data('md.score')
    };

    function onKeyUp(evt) {
        var query = input.val();
        if (query == '' || query === options.initialText) {
            doReset();
        } else {
            doSearch();
        };
    }

    function doSearch(query) {
        var query, elements, el, finder, string, score;
        query    = input.val();
        finder   = options.text;
        elements = collection.find(options.element);
        collection.html(
            $.each(elements, function() {
                el = $(this);
                switch(typeof finder) {
                case 'string':
                    string = el.find(finder).text();
                    break;
                case 'function':
                    string = finder(el);
                    // function should return a string. - but allow a jquery object.
                    if (typeof string == 'object' && string.jquery) {
                        string = string.text();
                    };
                    break;
                case 'object': // if (finder.constructor == Array)
                    console.log('array finder');
                    string = $.map(finder, function(selector, idx) {
                        console.log(finder, this, selector, idx);
                        console.log(selector);
                        return el.find(selector).text();
                    }).join(' ');
                    console.log(string);
                    break;
                };
                score  = LiquidMetal.score(string, query);
                $.log('md.doSearch query=' +query+',string='+string+',score:'+score);
                el.data('md.score', score);
                if (score > (options.minimumScore || 0)) {
                    el.show();
                } else {
                    el.hide();
                }
            }).sort(sortByScore)
        );
    };

    function doReset() {
        collection.html(collection.data('md.cache'));
        collection.find(options.element).show();
    };

    function assertHasProperties (obj, propertyList) {
        $.each(propertyList, function(idx) {
            if (!obj.hasOwnProperty(this)) throw('missing property ' + this);
        });
    };

    // this is only required if using a legacy version of jQuery
    // $.fn.sort = function() { return this.pushStack([].sort.apply(this, arguments), []); };

    $.fn.metalDetector = function(userOptions) {
        input      = $(this);
        options    = $.extend( (input.data('md.options') || defaults), userOptions);
        $.log('metalDetector', this, options);

        // ignore the initial field value - covers the case we have ghost text like
        // 'Type here to search'
        if (typeof options.initialText == 'undefined') {
            options.initialText = $(input).val();
        };

        // options are stored to be used as defaults on subsequent invocations
        // i.e., options do not need to be passed in again when refreshing (see below)
        input.data('md.options', options);
        // validate options
        assertHasProperties(options, ['collection', 'element', 'text']);
        // store the elements in their original position and state
        // if the elements are ever updated, eg. via an ajax call,
        // just call $(element).metalDetector() again.
        collection = $(options.collection);
        collection.data('md.cache', collection.html());

        $(this).unbind('keyup');
        $(this).keyup(onKeyUp);
        onKeyUp();
        return this;
    };

})(jQuery);

// e.g.
//
// $('#search').metalDetector({
//   collection: '#searchable',
//   target: '#searchable tr'
// });
//



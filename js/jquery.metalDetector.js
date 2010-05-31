//

(function($) {
    var input, collection, options;

    var defaults = {
        // collection: '#searchable',
        // target:     '#searchable tr',
        text: function(el) { return $(el).text(); }
    };

    function sortByScore(a, b) {
        return $(b).data('md.score') - $(a).data('md.score')
    };

    function doSearch() {
        var query, elements, el, finder, string, score;
        query    = input.val();

        if (query === options.initialText) { query = ''; }
        elements = collection.find(options.element);
        collection.html(
            $.each(elements, function() {
                el     = $(this);
                finder = options.text;
                if (typeof finder == 'string') {
                    string = el.find(finder).text();
                } else if (typeof finder == 'function') {
                    string = finder(el);
                    if (typeof string == 'object') {
                        string = string.text(); // assume it's a jQuery element and they were lazy
                    }
                }

                score  = LiquidMetal.score(string, query);

                el.data('md.score', score);
                if (score > (options.minimumScore || 0)) {
                    el.show();
                } else {
                    el.hide();
                }
            }).sort(sortByScore)
        );
    };

    // if you're inserting new elements into the DOM and you care about how they will
    // be ordered, you might want to set their md.index when you insert them.
    function indexContents() {
        var i = 0;
        elements = collection.find(options.element);
        $.each(elements, function() {
            $(this).data('md.index', i ++);
        });
    }

    function sortByIndex(a,b) {
        // console.log($(b).data('md.index'), $(a).data('md.index'));
        return $(b).data('md.index') - $(a).data('md.index');
    }

    // restore the collection to the way it was in collectionCache
    function doReset() {
        collection.html(collection.find(options.element).show().sort(sortByIndex));
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
        if (typeof options.initialText == 'undefined') {
            console.log('initaltext setup')
            console.log(input.val());

            options.initialText = $(input).val();
        }

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
        $(this).keyup(function(e){ input.val() == '' ? doReset() : doSearch(); });

        //if (options.update) { // pass update: true if we want to fire the event on load
        $(this).trigger('keyup');
        //}

        indexContents();
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



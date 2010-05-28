// 

(function($) {
  var input, collection, options;

  var defaults = {
    // collection: '#searchable',
    // target: '#searchable tr',
    text: function(el) { return $(el).text(); }
  };
  
  function sortByScore(a, b) {
    return $(b).data('md.score') - $(a).data('md.score')
  };
  
  function doSearch() {
    var query, elements, el, string, score;
    query    = input.val();
    elements = $(options.target);
    collection.html(
      $.each(elements, function() {
        el     = $(this);
        string = options.text(el);
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

  // restore the collection to the way it was in collectionCache
  function doReset() {
    collection.html(collection.data('md.cache'));
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
    // options are stored to be used as defaults on subsequent invocations
    // i.e., options do not need to be passed in again when refreshing (see below)
    input.data('md.options', options);
    // validate options
    assertHasProperties(options, ['collection', 'target', 'text']);
    // store the elements in their original position and state
    // if the elements are ever updated, eg. via an ajax call, 
    // just call $(element).metalDetector() again.
    collection = $(options.collection);
    collection.data('md.cache', collection.html());
    
    $(this).unbind('keyup');
    $(this).keyup(function(e){ input.val() == '' ? doReset() : doSearch(); });
    $(this).trigger('keyup');
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
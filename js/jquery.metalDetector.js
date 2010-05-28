(function($) {
  var collectionCache, input, collection, options;

  var defaults = {
    // collection: '#searchable',
    // target: '#searchable tr',
    text: function(el) { return $(el).text(); }
  };
  
  // sort method
  function byScore(a,b) {
    return $(a).data('liquidmetal.score') > $(b).data('liquidmetal.score');
  }
  
  function doUpdate() {
    var query, elements, el, string, score;
    query    = input.val();
    elements = $(options.target);
    collection.html($.each(elements, function() {
      el     = $(this);
      string = options.text(el);
      score  = LiquidMetal.score(string, query);
      el.data('liquidmetal.score', score);            
      if (score > (options.minimumScore || 0)) {
        el.show();
      } else {
        el.hide();
      }      
    }).sort(byScore));
  };

  // restore the collection to the way it was in collectionCache
  function doReset() {
    collection.html(collection.data('elementCache'));
  };
  
  function assertHasProperties (obj, propertyList) {
    $.each(propertyList, function(idx) {
      if (!obj.hasOwnProperty(this)) throw('missing property ' + this);      
    });
  };

  $.fn.sort = function() { return this.pushStack([].sort.apply(this, arguments), []); };
  
  $.fn.metalDetector = function(userOptions) {
    input      = $(this);
    options    = $.extend(defaults, userOptions);    
    // validate options
    assertHasProperties(options, ['collection', 'target', 'text']);
    // store the elements in their original position
    collection = $(options.collection);
    collection.data('elementCache', collection.html());
    // collectionCache = $(options.collection).html();
    // add the event handler
    $(this).keyup(function(e){ input.val() == '' ? doReset() : doUpdate(); });
    // TODO export methods for manipulating the collection cache
  };

})(jQuery);
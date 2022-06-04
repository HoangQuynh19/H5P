var H5P = H5P || {};
 
H5P.Pdf = (function ($) {
  /**
   * Constructor function.
   */
  function Pdf (options, id) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      greeting: 'Hello world!',
      image: null
    }, options);
    // Keep provided id.
    this.id = id;
  };
 
  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
   Pdf .prototype.attach = function ($container) {
    // Set class on container to identify it as a greeting card
    // container.  Allows for styling later.
    $container.addClass("h5p-Pdf");
    // Add image if provided.
    if (this.options.image && this.options.image.path) {
      $container.append('<img class="greeting-image" src="' + H5P.getPath(this.options.image.path, this.id) + '">');
    }
    // Add greeting text.
    $container.append('<div class="greeting-text">' + this.options.greeting + '</div>');
  };
 
  return Pdf ;
})(H5P.jQuery);
var H5P = H5P || {};
 
H5P.Chart = (function ($) {
  /**
   * Constructor function.
   */
  function C(options, id) {
    // Extend defaults with provided options
    this.options = options
    if (this.options.graphMode) {
        // Initialize graphMode
        this.graphMode = H5P.newRunnable(this.options.graphMode, this.id);
       
        // Trigger resize events on the graphMode:
        this.on('resize', function (event) {
          this.graphMode.trigger('resize', event);
        });
      }
    // Keep provided id.
    this.id = id;
  };
 
  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    
    if (this.graphMode) {
        // Create a container for the graphMode
        var $taskHolder = $('<div>');
       
        // Attach the graphMode to the container
        this.graphMode.attach($taskHolder);
       
        // Append the graphMode container to our content types container
        $container.append($taskHolder);
      }
  };
 
  return C;
})(H5P.jQuery);

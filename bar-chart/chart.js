/*global H5P*/

/**
 * Graph Cake module
 * @external {jQuery} $ H5P.jQuery
 * @external {EventDispatcher} EventDispatcher H5P.EventDispatcher
 */
 H5P.BarChart = (function ($, EventDispatcher) {

  /**
   * Initialize module.
   *
   * @class
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   */
  function BarChart(params) {
    var self = this;

    // Inheritance
    EventDispatcher.call(self);

    // Set params and filter data set to make sure it's valid
    self.params = params;
    if (self.params.listOfTypes) {
      BarChart.filterData(self.params.listOfTypes);
    }
    else {
      self.params.listOfTypes = [];
    }

    // Set the figure definition for readspeakers if it doesn't exist
    if (!self.params.figureDefinition) {
      self.params.figureDefinition = "Note";
    }

    // Keep track of type.
   
    self.type = ('Bar');
       
  }

  // Inheritance
  BarChart.prototype = Object.create(EventDispatcher.prototype);
  BarChart.prototype.constructor = BarChart;

  /**
   * Make sure the data set has set the required text and value properties.
   *
   * @param {Array} dataSet
   */
  BarChart.filterData = function (dataSet) {
    // Cycle through data set
    for (var i = 0; i < dataSet.length; i++) {
      var row = dataSet[i];
      if (row.text === undefined || row.value === undefined) {
        // Remove invalid data
        dataSet.splice(i, 1);
        i--;
        continue;
      }

      row.text = row.text.trim();
      row.value = parseFloat(row.value);
      if (row.text === '' || isNaN(row.value)) {
        // Remove invalid data
        dataSet.splice(i, 1);
        i--;
        continue;
      }
    }
  };

  /**
   * Append field to wrapper.
   *
   * @param {H5P.jQuery} $container
   */
  BarChart.prototype.attach = function ($container) {
    var self = this;

    if (self.$wrapper === undefined) {
      
      self.$wrapper = $('<div/>', {
        'class': 'h5p-chart-chart h5p-chart-' + self.type.toLowerCase()
      });
      
      self.barchart = new H5P.BarChart.Bar(self.params, self.$wrapper);
    }

    // Prepare container
    self.$container = $container.html('').addClass('h5p-chart').append(self.$wrapper);

    // Handle resizing
    self.on('resize', function () {
      if (!self.$container.is(':visible')) {
        return; // Only handle if visible
      }
      // Resize existing chart
      self.barchart.resize();
    });
  };

  return BarChart;
})(H5P.jQuery, H5P.EventDispatcher);

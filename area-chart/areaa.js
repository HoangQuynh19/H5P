/*global d3*/
H5P.AreaChart.Area = (function () {

  /**
   * Creates a bar chart from the given data set.
   *
   * @class
   * @param {array} params from semantics, contains data set
   * @param {H5P.jQuery} $wrapper
   */
  function Area(params, $wrapper) {
    var self = this;

    var dataSet = params.listOfTypes;
    var nAxis = [params.xAxis, params.yAxis];
    var namee = ["Tốc độ tăng trưởng (%)", "Năm"]
    time = ['2016', '2018', '2020', '2022'];
    preDataSet = [
      {
        name: " Hat đièu",
        color: 'red',
        figures: [50, 60, 70, 90]
      }
      ,
      {
        name: "Cao su",
        color: 'blue',
        figures:
          [150, 200, 100, 135]
      },
      {
        name: "Cà phê",
        color: 'pink',
        figures: [700, 210, 120, 150]
      }
    ]
console.log("****");
     console.log(preDataSet);
     console.log("****");
    // Create SVG element
    var svg = d3.select($wrapper[0]).append("svg");

    svg.append("desc").html("chart");

    // Processing Data
    var nElement = preDataSet.length;
    var nFigure = time.length;

    function ratio(number1, number2) {
      result = 0;
      if (number1 != 0) {
        result = number1 / number2 * 100;
      }
      return result;
    }

    function sumFigures(preData) {

      var sum = [];
      for (var i = 0; i < nElement; i++) {
        sum[i] = 0;
      }
      for (data of preData) {
        for (var i = 0; i < data.figures.length; i++) {
          sum[i] += data.figures[i]
        }
      }
      return sum;
    }

    function dataProcessing(preData) {
     
      var sum = sumFigures(preData);
      for (data of preData) {
        for (var i = 0; i < data.figures.length; i++) {
          data.figures[i] = ratio(data.figures[i], sum[i]).toFixed(2);
        }
      }
      return dataSet;
    }

    // exchanged coordinates
    function calculate(preData) {
      var dataSet = dataProcessing(preData);

      for (var k = 0; k < nElement; k++) {
        var final = [];
        for (var i = 0; i < nFigure; i++) {
          final[i] = 0;

        }
        for (var i = 0; i < nFigure; i++) {
          for (var j = 0; j <= k; j++) {
            var t = dataSet[j].figures[i] - 0;
            final[i] += t;
          }
          if (k == nElement - 1) {
            final[i] = parseInt(final[i])
          }
          else
            final[i].toFixed(2);

        }

        dataSet[k].exchanged = exchange(final, dataSet[k].figures)

      }

      return dataSet;
    }

    function exchange(data, dataOld) {
      var exchanged = [];

      for (var i = 0; i < data.length; i++) {
        exchanged[i] = { x: (i), y: data[i].toFixed(2), z: dataOld[i] }
      }

      return exchanged;
    }

    var dataProcessed = calculate(preDataSet);
    console.log(dataProcessed);

    // Create Scale

    var xScale = d3.scaleOrdinal();
    var yDomain = 100;
    var yScale = d3.scaleLinear().domain([0, yDomain]);

    var xAxis = d3.axisBottom(xScale).tickFormat("");;
    var yAxis = d3.axisLeft(yScale);

    var yAxisG = svg.append("g").attr("class", "y-axis");
    var xAxisG = svg.append("g").attr("class", "x-axis");

    var area = [];
    var texts = [];
    var areas = []
    for (var i = nElement - 1; i >= 0; i--) {
      areas[i] = svg.append('path').datum(dataProcessed[i]);

      texts[i] = svg.selectAll("textG").data(dataProcessed[i].exchanged).enter().append("text")
        .text(function (d) { return d.z + '%' });
    }

    var rects = svg.selectAll("rect").data(dataProcessed).enter().append('rect')
      .style('fill', d => d.color)
      .attr('width', 30).attr('height', 10)

    var numLabel = svg.selectAll("textGl").data(dataProcessed).enter().append("text")
      .attr('class', 'label').text(function (d) { return d.value });
    var nameAxis = svg.selectAll('textAx').data(namee).enter().append('text').attr('class', 'label-axis').text(function (d) { return d });

    var tick = svg.selectAll("tickFL").data(time).enter().append("text")
      .text(function (d) { return d });
    /**
     * Fit the current bar chart to the size of the wrapper.
     */
    self.resize = function () {
      // Always scale to available space
      var style = window.getComputedStyle($wrapper[0]);
      var w = parseFloat(style.width);
      var h = parseFloat(style.height);
      var fontSize = parseFloat(style.fontSize);
      var lineHeight = (1.25 * fontSize);
      var tickSize = (fontSize * 0.5);
      var spaceX = tickSize + 1.5 * lineHeight;
      var spaceY = tickSize + lineHeight + 40;

      var height = (h - spaceX) * 0.9; // Add space for labels below
      var width = (w - spaceY) * 0.8;

      var scaleX = width / (nFigure - 1);
      var scaleY = height / yDomain;


      // Update SVG size
      svg.attr("width", w).attr("height", h);

      xScale.range([0, width],);
      yScale.range([height, 0]);
      xAxis.tickSize([tickSize]);
      xAxisG.attr("transform", "translate(" + spaceY + "," + (height + lineHeight * 1.5) + ")")
        .call(xAxis);
      yAxisG.attr('transform', 'translate(' + spaceY + "," + lineHeight * 1.5 + ")").call(yAxis);

      for (var i = nElement - 1; i >= 0; i--) {
        area = d3.area()
          .x(function (d) { return d.x * scaleX })
          .y0(0)
          .y1(function (d) { return -d.y * scaleY })

        areas[i].attr('d', d => area(d.exchanged))
          .attr('fill', d => d.color)
          .attr("transform", "translate(" + spaceY + "," + (height + lineHeight * 1.5) + ")")

        texts[i].style('font-size', fontSize * 0.9)
          .attr('x', function (d, i) { return spaceY + i * (scaleX - fontSize * 1.5) })
          .attr('y', function (d) { return height + lineHeight * 2.2 - d.y * scaleY })
      }

      // label axis 
      nameAxis.attr('x', function (d, i) { return i * (width + spaceY - fontSize * d.length / 2) })
        .attr('y', function (d, i) { return i * (height + lineHeight * 2.5) + lineHeight })

      tick.attr('x', function (d, i) { return spaceY - fontSize * d.length / 4 + i * scaleX })
        .attr('y', height + lineHeight * 2.6)
      // Up date Note
      var spacing = 35;
      rects.attr('x', (spaceY + width + fontSize * 3))
        .attr('y', function (d, i) { return i * spacing })
        .attr('width', fontSize * 4)
        .attr('height', lineHeight * 1.5);
      numLabel.attr('x', (spaceY + width + fontSize * 4.5))
        .attr('y', function (d, i) { return i * spacing + lineHeight })
    }
  }

  return Area;
})();

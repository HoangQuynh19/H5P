/*global d3*/
H5P.LineChart.Line = (function () {

  /**
   * Creates a bar chart from the given data set.
   *
   * @class
   * @param {array} params from semantics, contains data set
   * @param {H5P.jQuery} $wrapper
   */
  function Line(params, $wrapper) {
    var self = this;
    var dataSet = params.listOfTypes;
    var nAxis = [params.yAxis, params.xAxis];
    dataSet.tickAxis = params.tickAxis;

    // Create SVG element
    var svg = d3.select($wrapper[0]).append("svg");

    svg.append("desc").html("chart");

    // numberTick
    var nTick = dataSet.tickAxis.length

    // Processing Data
    var maxY = 0;
    function ratio(number1, number2) {
      result = 0;
      if (number1 != 0) {
        result = number1 / number2 * 100;
      }
      return result;
    }

    function dataProcessing(preDataSet) {
      var dataSet = preDataSet;
      for (data of dataSet) {
        var n = nTick;
        if (data.figures.length < nTick) {
          n = data.figures.length;
        }
        for (var i = 1; i < n; i++) {
          data.figures[i] = ratio(data.figures[i], data.figures[0])
          if (data.figures[i] > maxY) {
            maxY = data.figures[i];
          }
        }
        data.figures[0] = 100;
        //   console.log(data.figures);
        data.exchanged = exchange(data.figures, n);
      }
      return dataSet;
    }

    function exchange(data, n) {
      var exchanged = [];
      var j = 0;

      for (var i = 0; i < n - 1; i++) {
        exchanged[i] = [{ x1: j, y1: data[i] }, { x2: j + 1, y2: data[i + 1] }]
        j++;
      }
      return exchanged
    }

    // Create Scale
    var yScale = d3.scaleLinear();
    var xScale = d3.scalePoint()
      .domain(dataSet.tickAxis)   
    var xAxis = d3.axisBottom(xScale)
    var yAxis = d3.axisLeft(yScale);

    var dataProcessed = dataProcessing(dataSet)

    var yAxisG = svg.append("g").attr("class", "y-axis");
    var xAxisG = svg.append("g").attr("class", "x-axis");

    var lines = [];
    var dot = []
    //   var texts  = []; 
    for (var i = 0; i < dataProcessed.length; i++) {
      lines[i] = svg.selectAll("lineG").data(dataProcessed[i].exchanged).enter().append('line')
        .style('stroke', dataProcessed[i].color)
        .attr('stroke-width', 2);
      var l = dataProcessed[i].exchanged.length
      var dataDot = dataProcessed[i].exchanged
      dataDot[l] = dataProcessed[i].exchanged[l - 1]
      dot[i] = svg
        .append("g")
        .selectAll("dot")
        .data(dataDot)
        .enter()
        .append("circle")
        .attr("r", 4)
        .attr("fill", dataProcessed[i].color)


    }
    var text = svg.selectAll("textG").data(dataSet).enter().append("text").style("opacity", 0)

    var lineNote = svg.selectAll("lineN").data(dataProcessed).enter().append('line')
      .style('stroke', function (d) { return d.color })
      .attr('stroke-width', 2);
    var numLabel = svg.selectAll("textGl").data(dataProcessed).enter().append("text")
      .attr('class', 'label').text(function (d) { return d.value });
    var nameAxis = svg.selectAll('textAx').data(nAxis).enter().append('text').attr('class', 'label-axis').text(function (d) { return d });
    var tick = svg.selectAll("tickFL").data(dataProcessed.tickAxis).enter().append("text")
      .text(function (d) { return d });
    svg.selectAll('tick').attr('stroke-width', '0.5px')

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
      var width = (w - spaceY) * 0.85;

      var yDomain = (Math.floor(maxY / 10) + 5) * 10;
      var scaleY = height / yDomain;

      // Update SVG size
      svg.attr("width", w).attr("height", h);

      // Update scales
      xScale.range([0, width]);
      yScale.domain([0, yDomain]).range([height, 0]);

      xAxisG.attr('transform', 'translate(' + spaceY + ',' + (height + lineHeight * 1.5) + ')').call(xAxis);

    
      yAxisG.attr('transform', 'translate(' + spaceY + ',' + (lineHeight * 1.5) + ')').call(yAxis);

      //line
      for (var i = 0; i < dataProcessed.length; i++) {

        lines[i]
          .attr('x1', (d, i) => spaceY + xScale(dataSet.tickAxis[i]))
          .attr('y1', d => height - d[0].y1 * scaleY + lineHeight * 1.5)
          .attr('x2', (d, i) => spaceY + xScale(dataSet.tickAxis[i + 1]))
          .attr('y2', d => height - d[1].y2 * scaleY + lineHeight * 1.5)

        dot[i].attr("cx", (d, i) => spaceY + xScale(dataSet.tickAxis[i]))
          .attr("cy", (d, i) => {
            if (i == nTick - 1) return height - d[1].y2 * scaleY + lineHeight * 1.5
            else return height - d[0].y1 * scaleY + lineHeight * 1.5
          }
          ).on("mousemove", (event, d) => {
            var coords = d3.pointer(event, svg.node());
            var t = `${d[0].y1.toFixed(2)}%`
            text
              .text(t)
              .attr("x", coords[0] + 10)
              .attr("y", coords[1] - 5)
              .style("opacity", 1)
          })
          .on("mouseleave", function (d) {
            text
              .style("opacity", 0)
          })

      }

      // label axis 
      nameAxis.attr('x', function (d, i) { return i * (width + spaceY - fontSize * d.length / 2) })
        .attr('y', function (d, i) { return i * (height + lineHeight * 2.5) + lineHeight })
      // tick
      // tick.attr('x', function (d, i) { return spaceY - fontSize * d.length / 4 + i * scaleX })
      //   .attr('y', height + lineHeight * 2.6)
      // Note
      var spacing = 25;
      lineNote.attr('x1', (spaceY + width + spacing))
        .attr('y1', function (d, i) { return i * spacing + lineHeight })
        .attr('x2', spaceY + width + spacing * 3)
        .attr('y2', function (d, i) { return i * spacing + lineHeight });
      numLabel.attr('x', (spaceY + width + spacing - fontSize))
        .attr('y', function (d, i) { return i * spacing + lineHeight * 1.25 })
    }
  }

  return Line;
})();

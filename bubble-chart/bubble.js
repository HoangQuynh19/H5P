/*global d3*/
H5P.BubbleChart.Bubble = (function () {

  /**
   * Creates a bar chart from the given data set.
   *
   * @class
   * @param {array} params from semantics, contains data set
   * @param {H5P.jQuery} $wrapper
   */
  function Bubble(params, $wrapper) {
    var self = this;

    var dataSet = params.listOfTypes;
    var nAxis = [params.yAxis, params.xAxis];

    // Create SVG element
    var svg = d3.select($wrapper[0]).append("svg");

    svg.append("desc").html("chart");

    var maxR = 0;
    var maxY = 0;
    var maxX = 0;

    for (data of dataSet) {
      // R max
      let r = d3.max(data.figures, function (d) { return d.r; })
      if (r > maxR) { maxR = r; }
      // Y max
      let y = d3.max(data.figures, function (d) { return d.y; })
      if (y > maxY) { maxY = y; }
      // X max
      let x = d3.max(data.figures, function (d) { return d.x; })
      if (x > maxX) { maxX = x; }
    }

    var yScale = d3.scaleLinear();
    var xScale = d3.scaleLinear();

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    var xAxisG = svg.append("g").attr("class", "x-axis");
    var yAxisG = svg.append("g").attr("class", "y-axis");

    var circles = [];
  
    for (var i = 0; i < dataSet.length; i++) {
      circles[i] = svg.selectAll("circleG").data(dataSet[i].figures).enter().append('circle')
        .style('fill', hexToRgbA(dataSet[i].color));

    }

    var rects = svg.selectAll("rect").data(dataSet).enter().append('rect')
      .style('fill', function (d) { return hexToRgbA(d.color) })
      .attr('width', 30).attr('height', 10)
    var text = svg.selectAll("textG").data(dataSet).enter().append("text").style("opacity", 0)

    var numLabel = svg.selectAll("textGl").data(dataSet).enter().append("text").attr('class', 'label').text(function (d) { return d.value });
    var nameAxis = svg.selectAll('textAx').data(nAxis).enter().append('text').attr('class', 'label-axis').text(function (d) { return d });

    function hexToRgbA(hex) {
      var c;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.3)';
      }
      throw new Error('Bad Hex');
    }

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
      var tickSize = (fontSize * 0.12);
      var spaceX = tickSize + 1.5 * lineHeight;
      var spaceY = tickSize + lineHeight + 40;

      // size of axis chart
      var height = (h - spaceX) * 0.9; // Add space for labels below
      var width = (w - spaceY) * 0.85;
      // radius
      var scaleR = height / 150;
      // Domain axis
      yDomain = height * maxY / (0.95 * height - scaleR * maxR);
      xDomain = maxX * width / (0.95 * width - scaleR * maxR);
      // unit axis
      var unitX = width / xDomain;
      var unitY = height / yDomain;
      // resize elements chart
      var loop = 0;
      for (data of dataSet) {
        for (d of data.figures) {
          let a = scaleR * d.r;
          if (d.x * unitX < a || d.y * unitY < a) {
            while ((d.x * unitX < a) || (d.y * unitY < a)) {
              //update scale radius
              scaleR = height / (100 + 50 * loop);
              a = scaleR * d.r;
              // update domain
              yDomain = height * maxY / (0.95 * height - scaleR * maxR);
              xDomain = maxX * width / (0.95 * width - scaleR * maxR);
              // update unit axis
              unitX = width / xDomain;
              unitY = height / yDomain;
              // To do!
              loop++;
              if (loop > 90000) break;
            }
          }
        }
      }

      // Update SVG size
      svg.attr("width", w).attr("height", h);

      // Update scales
      xScale.domain([0, xDomain]).range([0, width]);
      yScale.domain([0, yDomain]).range([height, 0]);

      // Axis
      xAxisG.attr('transform', 'translate(' + spaceY + ',' + (height + lineHeight * 1.5) + ')').call(xAxis);
      yAxisG.attr('transform', 'translate(' + spaceY + ',' + (lineHeight * 1.5) + ')').call(yAxis);
      // label axis
      nameAxis.attr('x', (d, i) => i * ((width + spaceY - fontSize * d.length / 2)))
        .attr('y', (d, i) => i * (height + lineHeight * 2.5) + lineHeight)
      // Circle + text
      for (var i = 0; i < dataSet.length; i++) {
        for (var j = 0; j < dataSet[i].figures.length; j++) {

          circles[i].attr('cx', d => spaceY + unitX * (d.x))
            .attr('cy', d => height + lineHeight * 1.5 - unitY * d.y)
            .attr('r', d => scaleR * d.r)
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px")
            .on("mousemove", (event, d) => {
              var coords = d3.pointer(event, svg.node());
              var t = `(${d.x}, ${d.y}, ${d.r})`
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
      }
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
  return Bubble;
})();

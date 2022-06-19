/*global d3*/
H5P.BarChart.Bar = (function () {

  /**
   * Creates a bar chart from the given data set.
   *
   * @class
   * @param {array} params from semantics, contains data set
   * @param {H5P.jQuery} $wrapper
   */
  function Bar(params, $wrapper) {
    var self = this;
    var dataSet = params.listOfTypes;
    groups = params.tickAxis
    var nAxis = [params.yAxis, params.xAxis];
    // Create SVG element
    var svg = d3.select($wrapper[0]).append("svg").attr("id", "svg");
    svg.append("desc").html("chart");
    //dataProcess
    var colorSet = [];
    var subgroups = [];
    var data = [];
    for (var i = 0; i < dataSet.length; i++) {
      colorSet[i] = dataSet[i].color;
      subgroups[i] = dataSet[i].text;
    }
    for (var i = 0; i < groups.length; i++) {
      data[i] = {}
      data[i]['group'] = groups[i];
      for (var j = 0; j < subgroups.length; j++) {
        data[i][`${subgroups[j]}`] = dataSet[j].figures[i]
      }
    }

    function sumFigures(dataSet) {
      var sum = [];
      for (var i = 0; i < groups.length; i++) {
        sum[i] = 0;
      }
      for (d of dataSet) {
        for (var i = 0; i < subgroups.length; i++) {
          sum[i] += d.figures[i]

        }
      }
      return sum;
    }

    // x Axis
    const xScale = d3.scaleBand();
    xScale.domain(groups).padding([0.2])
    var xAxisG = svg.append("g").attr("class", "x-axis");
    // y Axis
    var max = d3.max(sumFigures(dataSet))
    var yDomain = (Math.floor(max / 10) + 1) * 10;
    const yScale = d3.scaleLinear().domain([0, yDomain]);
    var yAxis = d3.axisLeft(yScale);
    var yAxisG = svg.append("g").attr("class", "y-axis");
    // Color Bar
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(colorSet)
    //Stack data
    const stackedData = d3.stack()
      .keys(subgroups)
      (data)
    // Show the bars
    svg.append("g").selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", d => color(d.key))
      .attr("class", d => "myRect " + d.key)
      .selectAll("rect")
      .data(d => d)
      .join("rect").attr("id", "bar")
    var text = svg.selectAll("textG").data(dataSet).enter().append("text").style("opacity", 0)

    // Action mouse 
    const mouseover = function (event, d) {
      const subGroupName = d3.select(this.parentNode).datum().key
      d3.selectAll(".myRect").style("opacity", 0.2)
      d3.selectAll("." + subGroupName).style("opacity", 1)
      text
        .style("opacity", 1)
    }

    const mouseleave = function (event, d) {
      d3.selectAll(".myRect")
        .style("opacity", 1)

      text
        .style("opacity", 0)
    }
    // Note
    var rects = svg.selectAll("rectN").data(dataSet).enter().append('rect')
      .style('fill', d => d.color)
      .attr('width', 30).attr('height', 10)
    var numLabel = svg.selectAll("textGl").data(dataSet).enter().append("text")
      .attr('class', 'label').text(function (d) { return d.value });
    // Name Axis
    var nameAxis = svg.selectAll('textAx').data(nAxis).enter().append('text').attr('class', 'label-axis').text(function (d) { return d });



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

      // Update SVG size
      svg.attr("width", w).attr("height", h);
      // Scale
      xScale.range([0, width])
      yScale.range([height, 0]);
      // Axis
      xAxisG.attr("transform", `translate(${spaceY}, ${height + lineHeight * 1.5})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0));
      yAxisG.attr("transform", `translate(${spaceY}, ${lineHeight * 1.5})`).call(yAxis);
      // Bar
      svg.selectAll('#bar').attr("x", d => spaceY + xScale(d.data.group))
        .attr("y", d => (lineHeight * 1.5 + yScale(d[1])))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("mousemove", (event, d) => {
          var coords = d3.pointer(event, svg.node());
          var t = d[1] - d[0]
          text
            .text(`value: ${t}`)
            .attr("x", coords[0] + 5)
            .attr("y", coords[1] - 5)
            .style("opacity", 1)
        })

      // Name Axis
      nameAxis.attr('x', function (d, i) { return i * (width + spaceY - fontSize * d.length / 2) })
        .attr('y', function (d, i) { return i * (height + lineHeight * 2.5) + lineHeight })
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

  return Bar;
})();

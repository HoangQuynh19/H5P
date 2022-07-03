/*global d3*/
H5P.PieChart.Pie = (function () {

  /**
   * Creates a pie chart from the given data set.
   *
   * @class
   * @param {array} params from semantics, contains data set
   * @param {H5P.jQuery} $wrapper
   */
  function Pie(params, $wrapper) {
    var self = this;
    var dataSet = params.listOfTypes;

    data = [{ a: 9, b: 20, c: 30, d: 8, e: 12 }, { a: 6, b: 16, c: 20, d: 14, e: 19, f: 12, q: 14 }]

    //  document.getElementById("button").style.width = " 100px"
    var svg = d3.select($wrapper[0]).append("svg").attr("id", "svg");
    svg.append("desc").html("chart");
    const color = d3.scaleOrdinal()
      .domain(["a", "b", "c", "d", "e", "f", "q"])
      .range(["red", "black", "green", "blue","pink","yellow","grey"]);

    //   var text = svg.selectAll("textG").data(data).enter().append("text").style("opacity", 0)
    const tooltip = d3.select($wrapper[0])
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")

    var rects = svg.selectAll("rectN").data(data).enter().append('rect')
    var numLabel = svg.selectAll("textGl").data(data).enter().append("text")
      .attr('class', 'label').text("1");

    function update(data, radius, height, fontSize, lineHeight) {
      const pie = d3.pie()
        .value(function (d) { return d[1]; })
        .sort(function (a, b) { return d3.ascending(a.key, b.key); })
      const data_ready = pie(Object.entries(data))

      const u = svg.selectAll("path").data(data_ready)
      const text = svg.selectAll("textP").data(data_ready)
      const box = svg.selectAll("rectP").data(data_ready)

      u
        .join('path')
        .attr("transform", "translate(" + (height) + "," + (height / 2) + ")")
        .transition()
        .duration(700)
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(radius)
        )
        .attr('fill', function (d) { return (color(d.data[0])) })
        .attr("stroke", "white")
        .attr("class", d => "myRect " + d.key)
        .style("stroke-width", "2px")
        .style("opacity", 1)
      svg.selectAll("path").join("title")
        .text(d => `${d.data[0]}: ${d.data[1]}`)
        .on("mousemove", (event, d) => {
          var coords = d3.pointer(event, svg.node());
          var t = `${d.data[0]}: ${d.data[1]}`
          box.attr('x', coords[0] + 5)
            .attr('y', coords[1] - lineHeight * 1.6)
            .attr('width', fontSize * t.length * 0.7).attr('height', lineHeight * 2)
            .style("opacity", 1)
            .style("display", "block")
          text.text(t)
            .attr("x", coords[0] + 10)
            .attr("y", coords[1] - 5)
            .style("opacity", 1)
            .style("display", "block");

        })
        .on("mouseleave", function (d) {
          text.style("opacity", 0)
            .style("display", "none")
          box.style("opacity", 0)
            .style("display", "none")
        })
      text.join("text").style("opacity", 0) .transition();
      box.join("rect") .transition()
        .attr('rx', 5)
        .attr('ry', 5)
        .attr("style", "fill:rgba(192,192,192,0.3);stroke:black;stroke-width:1")
        .style("opacity", 0)


    }

    /**
     * Fit the current chart to the size of the wrapper.
     */
    self.resize = function () {
      // Scale to smallest value of height and width
      var style = window.getComputedStyle($wrapper[0]);
      var scaleTo = Math.min(parseFloat(style.width), parseFloat(style.height));
      var fontSize = parseFloat(style.fontSize);
      var lineHeight = (1.25 * fontSize);
      var w = parseFloat(style.width);
      var width = w
      var height = scaleTo;
      var radius = Math.min(width, height) / 2;

      svg.attr('width', width + 'px')
        .attr('height', height + 'px')
      update(data[0], radius, height, fontSize, lineHeight)
      var spacing = 35;
      rects.attr('x', width * 0.85)
        .attr('y', function (d, i) { return (i + 0.5) * spacing })
        .attr('width', 40).attr('height', 20)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr("style", "fill:rgba(255,255,0,0.3);stroke:black;stroke-width:2;opacity:0.5")
        .on("mousedown", (event, d) => {
          update(d, radius, height, fontSize, lineHeight)
        })
      numLabel.attr('x', (width * 0.85 + fontSize * 1.4))
        .attr('y', function (d, i) { return (i + 0.5) * spacing + lineHeight })
    };
  }

  return Pie;
})();

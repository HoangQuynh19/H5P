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
    preDataSet  = [
      {      
        name: " Hat đièu",
        value: 1,
        color: 'red',
        figures:[
          {
            time: '2016',
            value: 100
          },
         {
            time: '2018',
            value: 150
          },
         {
            time: '2020',
            value: 50
          },
          {
            time: '2022',
            value: 75
          }
            
        ]
      },
      {      
        name: " Hat sen",
        value: 1,
        color: 'black',
        figures:[
          {
            time: '2016',
            value: 80
          },
         {
            time: '2018',
            value: 130
          },
         {
            time: '2020',
            value: 70
          },
          {
            time: '2022',
            value: 120
          }
            
        ]
      }
    ]
   // console.log(dataSet);

    // Create SVG element
    var svg = d3.select($wrapper[0]).append("svg");

    svg.append("desc").html("chart");
    
    // Processing Data
    var maxY = 0;
    function ratio(number1, number2) {
      result = 0;
      if ( number1 != 0) {
        result = number1/number2*100;
      } 
      return result;    
    }

    function dataProcessing(preDataSet){ 
      var dataSet = preDataSet;
      for ( data of dataSet){       
          for (var i = 1; i < data.figures.length; i++){
            data.figures[i].value = ratio(data.figures[i].value,data.figures[0].value)
            if ( data.figures[i].value  > maxY) {    
              maxY = data.figures[i].value;
            }
          }
          data.figures[0].value = 100;
       //   console.log(data.figures);
          data.exchanged = exchange(data.figures);
      }
      return dataSet;
    }
  
    function exchange(data){
      var exchanged = [];
      var j = 0;
      for (var i = 0; i< data.length-1; i++){
        exchanged[i] = [ {x1: j, y1: data[i].value }, {x2: j+1, y2: data[i+1].value}]     
        j++;   
      }
      return exchanged
    }
    dataProcessed = dataProcessing(preDataSet);
    // firse tick
    var fltick = [ dataProcessed[0].figures[0].value,dataProcessed[0].figures[nTick].value];
    
  // numberTick
  var nTick= dataProcessed[0].figures.length-1
  // Create Scale
    var yScale = d3.scale.linear();
    var xScale = d3.scale.ordinal().domain(d3.range(nTick-1));


    var x = d3.time.scale();
    var yAxis = d3.svg.axis();

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .tickFormat(function (d,i) {
        console.log(d)
        return dataProcessed[0].figures[i+1].time;
      });

    var yAxisG = svg.append("g") .attr("class", "y-axis");
    var xAxisG = svg.append("g").attr("class", "x-axis");

    var lines = [];
    
 //   var texts  = []; 
    for (var i = 0; i < dataProcessed.length; i++){  
    
      lines[i] = svg.selectAll("lineG").data(dataProcessed[i].exchanged).enter().append('line')
        .style('stroke',dataProcessed[i].color)
        .attr('stroke-width', 2);
        
    }     
    var lineNote =  svg.selectAll("lineN").data(dataProcessed).enter().append('line')
        .style('stroke',function(d){ return d.color})
        .attr('stroke-width', 2);  
        var numLabel = svg.selectAll("textGl").data(dataProcessed).enter().append("text")
          .attr('class','label').text(function(d){ return d.value});
     //     var nameAxis = svg.selectAll('textAx').data(nAxis) .enter().append('text').attr('class','label-axis').text(function(d){return d});
    var tick = svg.selectAll("tickFL").data(fltick).enter().append("text")
      .text(function(d){ return d.value});

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
        var tickSize = (fontSize * 0.125);
        var spaceX = tickSize + 1.5*lineHeight ;
        var spaceY = tickSize + lineHeight + 40;
 
        var height = h - spaceX ; // Add space for labels below
        var width = (w - spaceY)*0.8;


        var yDomain = maxY + 50;
        var scaleX = width/nTick;
        var scaleY = height/yDomain;
      
      
      
       // Update SVG size
      svg.attr("width", w).attr("height", h);

      // Update scales
      xScale.rangeRoundBands([0, width], 1);
      yScale.domain([0, yDomain]).range([height, 0]);
     
      xAxis.tickSize([tickSize]);
      xAxisG.attr("transform", "translate("+spaceY+",+" + height + ")")
        .call(xAxis);

      yAxis.scale(yScale).orient("left");  
      yAxisG.attr('transform', 'translate('+spaceY+',0)').call(yAxis);


  //   console.log(texts)
      for(var i = 0; i < dataProcessed.length; i++ ) { 
          lines[i]
          .attr('x1', function(d,i){ console.log( d[0].x1); return d[0].x1*scaleX+ spaceY})
            .attr('y1', function(d,i){ return height- d[0].y1*scaleY})
            .attr('x2', function(d,i){ return d[1].x2*scaleX+ spaceY})
            .attr('y2', function(d,i){ return height- d[1].y2*scaleY})
        
      }
      tick.attr('x', height + lineHeight)
          .attr('y', function(d,i) {
            return spaceY+ i*width
          })
      var spacing = 35;
      lineNote.attr('x1', (spaceY + width + spacing)) 
          .attr('y1', function(d,i) { return i*spacing})
          .attr('x2', spaceY + width + spacing*2)
          .attr('y2', function(d,i) { return i*spacing});
      numLabel.attr('x', (spaceY + width + spacing -fontSize)) 
          .attr('y', function(d,i) { return i*spacing + lineHeight})

    }
  }

  return Line;
})();

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
  
   // console.log(dataSet);

    // Create SVG element
    var svg = d3.select($wrapper[0]).append("svg");

    svg.append("desc").html("chart");

    var maxR = 0;
    var maxY = 0;   
    var maxX = 0;
      
    for (data of dataSet){       
        // R max
        let r = d3.max(data.figures, function (d) {return d.r ;})
        if (r > maxR) {maxR = r;}
        
        // Y max
        let y = d3.max(data.figures, function (d) {return d.y ;})                 
        if (y > maxY) {maxY = y;}
        // X max
        let x= d3.max(data.figures, function (d) {return d.x ;})
        if (x > maxX) {maxX = x;}                   
      }

    var yScale = d3.scale.linear();
    var xScale = d3.scale.linear();

    var xAxis = d3.svg.axis();
    var yAxis = d3.svg.axis();

    var xAxisG = svg.append("g").attr("class", "x-axis");
    var yAxisG = svg.append("g") .attr("class", "y-axis");

    var circles = [];
    var texts  = []; 
    
    for (var i = 0; i < dataSet.length; i++){  
    circles[i] = svg.selectAll("circleG").data(dataSet[i].figures).enter().append('circle')
        .style('fill',hexToRgbA(dataSet[i].color));

    texts[i] = svg.selectAll("textG").data(dataSet[i].figures).enter().append("text").text(function(d){ return d.r});
    
    }
    var rects = svg.selectAll("rect").data(dataSet).enter().append('rect')
    .style('fill', function(d){ return hexToRgbA(d.color)})
    .attr('width', 30).attr('height',10)
    
    var numLabel = svg.selectAll("textGl").data(dataSet).enter().append("text").attr('class','label').text(function(d){ return d.value});
         

    function ratio(number1, number2) {
      result = 0;
      if ( number1 != 0) {
        result = number2/number1*100;
      } 
      return result;    
    }

    preDataSet  = [
      {      
        name: " Hat đièu",
        color: 'red',
        figures:{
          figure1: {
            time: '2016',
            value: 120
          },
          figure1: {
            time: '2018',
            value: 269
          },
          figure1: {
            time: '2020',
            value: 350
          }
        }
      },
      {      
        name: "Cao su",
        color: 'blue',
        figures:{
          figure1: {
            time: '2016',
            value: 170
          },
          figure1: {
            time: '2018',
            value: 200
          },
          figure1: {
            time: '2020',
            value: 120
          }
        }
      }
    ]
    function dataProcessing(preDataSet){ 
      dataSet = [];


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
        var tickSize = (fontSize * 0.125);
        var spaceX = tickSize + 1.5*lineHeight ;
        var spaceY = tickSize + lineHeight + 40;
 
        var height = h - spaceX ; // Add space for labels below
        var width = (w - spaceY)*0.8;

        var scaleR = height/150;
      
        yDomain = height*maxY/ (0.95*height- scaleR*maxR)  ;
        xDomain = maxX*width/(0.95*width- scaleR*maxR) ;
  
        var unitX = width/xDomain;
        var unitY = height/yDomain;

        var loop = 0 ;
        for (data of dataSet){ 
            for( d of data.figures){
              let a = scaleR*d.r;                  
               if(d.x*unitX < a || d.y*unitY < a) {
 
                 while( (d.x*unitX < a) || (d.y*unitY < a ) ){
                // console.log(" check  "+d.x*unitX+ '  __  '+ a +' __ '+ d.y*unitY)
                 scaleR = height/(100+50*loop);
                 a = scaleR*d.r;
                 yDomain = height*maxY/ (0.95*height- scaleR*maxR)  ;
                 xDomain = maxX*width/(0.95*width- scaleR*maxR) ;
 
                 unitX = width/xDomain;
                 unitY = height/yDomain;
                  loop++;
                 // console.log('loop '+loop + "  Dy  "+unitY);
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
     
      xAxis.scale(xScale).orient("bottom");
      yAxis.scale(yScale).orient("left");

      xAxisG.attr('transform', 'translate('+spaceY+','+height+')').call(xAxis);
      yAxisG.attr('transform', 'translate('+spaceY+',0)').call(yAxis);


  //   console.log(texts)
      for(var i = 0; i < dataSet.length; i++ ) {
        for (var j = 0; j < dataSet[i].figures.length; j++){
          var a = 10*i+ 10*j +10;
        //  console.log(a);
          texts[i].
           attr('x', function(d) { return spaceY + unitX*(d.x) - fontSize/2})
           .attr('y',function(d) { return height - unitY*d.y + lineHeight/4})    
          var cx = 
          circles[i]
            .attr('cx', function(d) { return spaceY + unitX*(d.x)})  
            .attr('cy',function(d) { return height - unitY*d.y})
            .attr('r',function(d) { return scaleR*d.r}); 
        }
      }

      
      var spacing = 35;
      rects.attr('x', (spaceY + width + fontSize*3)) 
          .attr('y', function(d,i) { return i*spacing})
          .attr('width', fontSize*4)
          .attr('height', lineHeight*1.5);

      numLabel.attr('x', (spaceY + width + fontSize*4.5)) 
      .attr('y', function(d,i) { return i*spacing +lineHeight})
    }
  }

  return Line;
})();

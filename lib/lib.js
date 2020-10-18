'use strict';

const getData = async() => {

    // load in the csv data
    var data = await d3.csv('lib/data/top_100.csv');

   var allData =[]; 
   let parsetime = d3.timeParse('%Y-%m');
   var groupedData = [];
   var data =  await d3.csv('lib/data/top_100.csv', function(d) {
    return {
      person: d.person,
      date: parsetime(d.year_month),/* Fill in */ // We need to parse the date string into a Date object using d3.timeParse. Here, the string looks like 10/15/19 (%m/%d/%y).
      screentime: +d.screen_time_seconds
    };
  }).then(function(rawData) {

    // Get array of all unique persons' names
    let allPeople = [];
    rawData.forEach(e => {
        let personEntry = {person: e.person, values: [{date: e.date, screentime: e.screentime}]};
        allData.push(e);
        let person = e.person;
        if (!allPeople.includes(person)){
            allPeople.push(person);
            groupedData.push(personEntry);
        } else {
            groupedData[(allPeople.indexOf(person))].values.push({date: e.date, screentime: e.screentime});
        }
    });
    //console.log(groupedData);
  });
  return [allData, groupedData];
}


function addAxes(svg, xScale, yScale, plotVars){
 
    var xMargin = xScale.copy().range([plotVars.plotMargin, plotVars.plotWidth - plotVars.plotMargin]);
    var yMargin = yScale.copy().range([plotVars.plotHeight - plotVars.plotMargin, plotVars.plotMargin]);
    
    svg.append('g')
        .attr('transform', `translate(0, ${plotVars.plotHeight - plotVars.plotMargin})`)
        .call(d3.axisBottom(xMargin));
    
    svg.append('g')
        .attr('transform', `translate(${plotVars.plotMargin}, 0)`)
        .call(d3.axisLeft(yMargin));
    

    svg.append('text')             
      .attr('transform',
            'translate(' + (plotVars.plotWidth/2) + ' ,' + 
                           (plotVars.plotHeight - (plotVars.plotMargin /3 )) + ')')
      .style('text-anchor', 'middle')
      .text('Date');

  svg.append('text')
      //.attr('transform', 'rotate(-90)')
      .attr('y', 0 + (plotVars.plotMargin/3))
      .attr('x', 0 + (plotVars.plotMargin) + 20)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Screentime (sec)');      
}

function addLabels(svg, xScale, yScale, plotVars, groupedData){
    var names = [];
    groupedData.forEach(e =>{
        let name = e.person;
        let finalScreentime = e.values[e.values.length - 1].screentime;
        let y = yScale(finalScreentime);

        svg.append("text")
        .attr("fill", "black")
        .attr("stroke", null)
        .attr("stroke-width", 3)
        .attr("x", plotVars.plotWidth - plotVars.plotMargin + 3)
        .attr("y", y)
        .attr("font-size", 10)
        .text(name)
      //.clone(true)
       // .attr("fill", "black")
       // .attr("stroke", null);
    })
}

function addMoveCallback(rect) {
    function moved(event) {
      rect.attr("x", +rect.attr("x") + event.dx)  // Shift the x value by event.dx
        .attr("y", +rect.attr("y") + event.dy);   // Shift the y value by event.dy
    }
  
    // Attach callback to rect
    rect.call(d3.drag()
      .on("drag", moved)); // Use our 'moved' function
  }

function makeBrush(svg, lines){
    
}

function addRect(svg, x, y, width, height){
    
    let dims = {height: height, width: width, thickness: 6, x: x, y: y};
    
    let rect = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y)
        .attr("width", dims.width)
        .attr("height", dims.height)
        .style("fill", "blue")
        .style("cursor", "all-scroll");
  
    let controlRectTop = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y - (dims.thickness/2))
        .attr("width", dims.width)
        .attr("height", dims.thickness)  // Set the thickness to 6.
        .style("fill", "black")
        .style("cursor", "ns-resize");

    let controlRectBottom = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dimx.y + (dims.height - (dims.thickness/2)))
        .attr("width", 50)
        .attr("height", dims.thickness)  // Set the thickness to 6.
        .style("fill", "black")
        .style("cursor", "ns-resize");

    let controlRectRight = svg.append("rect")
        .attr("x", dims.x + dims.width - (dims.thickness/2))
        .attr("y", dims.y)
        .attr("width", dims.thickness)
        .attr("height", dims.width)  // Set the thickness to 6.
        .style("fill", "black")
        .style("cursor", "ns-resize");

    let controlRectLeft = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y)
        .attr("width", dims.thickness)
        .attr("height", dims.height)  // Set the thickness to 6.
        .style("fill", "black")
        .style("cursor", "ns-resize");

    var controlRects = [controlRectTop, controlRectRight, controlRectBottom, controlRectLeft];
    // var controlRects = {top: controlRectTop, right: controlRectRight, bottom: controlRectBottom, left: controlRectLeft};

    addMoveCallbackWithControls(rect, controlRects);
    addResizeCallback(rect, controlRectTop);
    addResizeCallbackBottom(rect, controlRectBottom);
    addResizeCallback(rect, controlRectLeft);
    addResizeCallback(rect, controlRectRight);
    //return svgPlotContainer.node();
}

function addMoveCallbackWithControls(rect, controlRects) {
    function moved(event) {
      rect.attr("x", +rect.attr("x") + event.dx)  // Shift the x value by event.dx
        .attr("y", +rect.attr("y") + event.dy);   // Shift the y value by event.dy
        
        /*let leftCtrl = controlRects.left;
        let topCtrl = controlRects.top;
        let bottomCtrl = controlRects.bottom;
        let rightCtrl = controlRects.right;

        // Shift Top ControlRect
        topCtrl.attr("x", +topCtrl.attr("x") + event.dx)  // Shift the x value by event.dx
            .attr("y", +e.attr("y") + event.dy);   // Shift the y value by event.dy

        // Shift Bottom ControlRect
        bottomCtrl.attr("x", +bottomCtrl.attr("x") + event.dx)  // Shift the x value by event.dx
        .attr("y", +e.attr("y") + event.dy);   // Shift the y value by event.dy

        // Shift Left ControlRect

        // Shift Right ControlRect*/
        
        controlRects.forEach( e => {
            e.attr("x", +e.attr("x") + event.dx)  // Shift the x value by event.dx
            .attr("y", +e.attr("y") + event.dy);   // Shift the y value by event.dy
        });
    }
  
    // Attach callback to rect
    rect.call(d3.drag()
      .on("drag", moved));
}

function addMoveCallbackWithControl(rect, controlRect) {
    function moved(event) {
      rect.attr("x", +rect.attr("x") + event.dx)  // Shift the x value by event.dx
        .attr("y", +rect.attr("y") + event.dy);   // Shift the y value by event.dy
      
        
        controlRect.attr("x", +controlRect.attr("x") + event.dx)  // Shift the x value by event.dx
          .attr("y", +controlRect.attr("y") + event.dy);        // Shift the y value by event.dy
    }
  
    // Attach callback to rect
    rect.call(d3.drag()
      .on("drag", moved));
  }

function addResizeCallbackTop(rect, controlRect) {
    let initialMouseY;
    let initialRectY;
    let initialRectHeight;
    
    // Obtain the initial rectangle and mouse status
    function resizeStarted(event) {
      initialMouseY = event.y;
      initialRectY = +rect.attr("y");
      initialRectHeight = +rect.attr("height");
    }
    
    function resized(event) {
        let minY = 0; // Compute the minimum value of y of the rect
        let maxY = 1200 - initialRectHeight - 6; // Compute the maximum value of y of the rect //TODO how?
      
        rect.attr("y", +rect.attr("y") + event.dy)            // set the new y of the rect
            .attr("height", +rect.attr("height") - event.dy); // set the new height of the rect
      
        controlRect.attr("y", initialRectY + event.y - initialRectY - 3); // Set the new y of the control
    }
    
    // Always keep the top control on top
    function resizeEnded(event) {
      let minY = Math.min(initialRectY + event.y - initialMouseY, initialRectY + initialRectHeight);
      
      controlRect.attr("y", minY - 3);
    }
  
    // Attach callback to controlRect
    controlRect.call(d3.drag()
      .on("start", resizeStarted)
      .on("drag", resized)
      .on("end", resizeEnded));
}

function addResizeCallbackBottom(rect, controlRectBottom) {
    let initialMouseY;
    let initialRectY;
    let initialRectHeight;
    
    // Obtain the initial rectangle and mouse status
    function resizeStarted(event) {
      initialMouseY = event.y;
      initialRectY = +rect.attr("y");
      initialRectHeight = +rect.attr("height");
    }
    
    function resized(event) {
      let minY = initialRectY + 6; // Compute the minimum value of y of the rect
      let maxY = 1200 - initialRectY - 3; // Compute the maximum value of y of the rect //TODO how?
      
      rect//.attr("y", +rect.attr("y") + event.dy)            // dont
        .attr("height", +rect.attr("height") - event.dy); // set the new height of the rect
      
      controlRectBottom.attr("y", initialRectY + event.y - initialRectY - 3); // Set the new y of the control
    }
    
    // Always keep the bottom control on bottom
    function resizeEnded(event) {
      let minY = Math.min(initialRectY + event.y - initialMouseY, initialRectY + initialRectHeight);
      
      controlRectBottom.attr("y", minY - 3);
    }
  
    // Attach callback to controlRect
    controlRectBottom.call(d3.drag()
      .on("start", resizeStarted)
      .on("drag", resized)
      .on("end", resizeEnded));
}

function createPlot(rawData, groupedData, svg){

    // Set up details of plot dimensions
    let plotVars = ({
        plotWidth: 1200,   // Width of plot region
        plotHeight: 600,  // Height of plot region
        plotMargin: 80   // Margin space for axes and their labels
    });

    let xScale = d3.scaleTime()
    .domain(d3.extent(rawData, r => r.date)) // Min-Max of Date
    .range([0 + plotVars.plotMargin, plotVars.plotWidth - plotVars.plotMargin]);

    let yScale = d3.scaleLinear()
    .domain([0, d3.max(rawData, r => r.screentime)]) // MIN-MAX OF SCREENTIME
    .range([plotVars.plotHeight - plotVars.plotMargin, 0 + plotVars.plotMargin]);

    var lineGenerator = d3.line()
        .x(v => xScale(v.date)) // date should go on the x-axis
        .y(v => yScale(v.screentime)); // screentime should go on the y-axis
    
    svg.attr('width', plotVars.plotWidth)
      .attr('height', plotVars.plotHeight)
      .style('background-color', 'whitesmoke');  // Color container bg to see its extent
    

    // Generate Lines
    svg.append('g')
      .selectAll('path')
      .data(groupedData)
      .join('path')
      .attr('class', 'data-line')               // Class name to be able to access the lines later
      .attr('d', d => lineGenerator(d.values))  // Use lineGenerator on d.values
      .attr('fill', 'none')                    // Do not fill the area defined by the path
      .attr('stroke', 'blue');   // Set a color for the line (The maps for color is in 'color')

    console.log(svg.node());

    // Add Axes and Labels
    addAxes(svg, xScale, yScale, plotVars);

    // Add labels for each line
    addLabels(svg, xScale, yScale, plotVars, groupedData);

    // Add rect when drawn
    addRect(svg, 100, 100, 50, 50);

    return svg.node();
}



export {getData, createPlot, addRect};
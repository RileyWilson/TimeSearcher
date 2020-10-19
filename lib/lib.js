'use strict';

var allRects = [];
var allBoxes = {};
var xScale;
var yScale;

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

function addRect(svg, x, y, width, height){
    
    let dims = {height: height, width: width, thickness: 3, x: x, y: y};
    
    let rect = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y)
        .attr("width", dims.width)
        .attr("height", dims.height)
        .style("fill", "firebrick")
        .style("cursor", "all-scroll");
  
    let controlRectTop = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y - dims.thickness)
        .attr("width", dims.width)
        .attr("height", dims.thickness)  // Set the thickness to 6.
        .style("fill", "black")
        .style("cursor", "ns-resize");

    let controlRectBottom = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y + (dims.height - dims.thickness))
        .attr("width", dims.width)
        .attr("height", dims.thickness)  // Set the thickness to 6.
        .style("fill", "grey")
        .style("cursor", "ns-resize");

    let controlRectRight = svg.append("rect")
        .attr("x", dims.x + dims.width - (dims.thickness))
        .attr("y", dims.y)
        .attr("width", dims.thickness)
        .attr("height", dims.height) 
        .style("fill", "green")
        .style("cursor", "ns-resize");

    let controlRectLeft = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y)
        .attr("width", dims.thickness)
        .attr("height", dims.height)
        .style("fill", "yellow")
        .style("cursor", "ns-resize");

    var controlRects = [controlRectTop, controlRectRight, controlRectBottom, controlRectLeft];
    var ctrls = {top: controlRectTop, right: controlRectRight, bottom: controlRectBottom, left: controlRectLeft};

    addMoveCallbackWithControls(rect, controlRects);
    addResizeCallbacks(rect, ctrls);
    //return svgPlotContainer.node();
}

function addResizeCallbacks(rect, ctrls){
    addResizeCallbackTop(rect, ctrls);
    addResizeCallbackBottom(rect, ctrls);
    addResizeCallbackLeft(rect, ctrls);
    addResizeCallbackRight(rect, ctrls);
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

function addResizeCallbackTop(rect, controls) {
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

        // Set the new height of the side controls
        controls.left.attr("y", +rect.attr("y") + event.dy).attr("height", +rect.attr("height") + event.dy); // set the new height and y of the rect
        controls.right.attr("y", +rect.attr("y") + event.dy).attr("height", +rect.attr("height") + event.dy); // set the new height and yof the rect
        controls.top.attr("y", +rect.attr("y")); // Set the new y of the control
    }
    
    // Always keep the top control on top
    function resizeEnded(event) {
      let minY = Math.min(initialRectY + event.y - initialMouseY, initialRectY + initialRectHeight);
      //controlRect.attr("y", minY - 3);
    }
  
    // Attach callback to controlRect
    controls.top.call(d3.drag()
      .on("start", resizeStarted)
      .on("drag", resized)
      .on("end", resizeEnded));
}

function addResizeCallbackBottom(rect, controls) {
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
      
        // Set the new height of the rect
        rect.attr("height", +rect.attr("height") + event.dy);

        // Set the new height of the side and controls
        controls.left.attr("height", +rect.attr("height") + event.dy); // set the new height of the rect
        controls.right.attr("height", +rect.attr("height") + event.dy); // set the new height of the rect
        controls.bottom.attr("y", +rect.attr("y") + +rect.attr("height") - 4); // Set the new y of the control
    }
    
    // Always keep the bottom control on bottom
    function resizeEnded(event) {
      let minY = Math.min(initialRectY + event.y - initialMouseY, initialRectY + initialRectHeight);
      //controlRectBottom.attr("y", minY - 3);
    }
  
    // Attach callback to controlRect
    controls.bottom.call(d3.drag()
      .on("start", resizeStarted)
      .on("drag", resized)
      .on("end", resizeEnded));
}

function addResizeCallbackLeft(rect, controls) {
    let initialMouseX;
    let initialRectX;
    let initialRectWidth;
    
    // Obtain the initial rectangle and mouse status
    function resizeStarted(event) {
      initialMouseX = event.X;
      initialRectX = +rect.attr("x");
      initialRectWidth = +rect.attr("width");
    }
    
    function resized(event) {
        // let minX = 0; // Compute the minimum value of y of the rect
        // let maxX = 1200 - initialRectHeight - 6; // Compute the maximum value of y of the rect //TODO how?
      
        rect.attr("x", +rect.attr("x") + event.dx)            // set the new x of the rect
            .attr("width", +rect.attr("width") - event.dx); // set the new width of the rect

        // Set the new width and x of the left and top and bottom controls
        controls.top.attr("x", +rect.attr("x") + event.dx).attr("width", +rect.attr("width") + event.dx); 
        controls.bottom.attr("x", +rect.attr("x") + event.dx).attr("width", +rect.attr("width") + event.dx);
        controls.left.attr("x", +rect.attr("x")); // Set the new x of the control
    }
    
    // Always keep the top control on top
    function resizeEnded(event) {
      let minY = Math.min(initialRectX + event.x - initialMouseX, initialRectX + initialRectWidth);
      //controlRect.attr("y", minY - 3);
    }
  
    // Attach callback to controlRect
    controls.left.call(d3.drag()
      .on("start", resizeStarted)
      .on("drag", resized)
      .on("end", resizeEnded));
}

function addResizeCallbackRight(rect, controls) {
    let initialMouseX;
    let initialRectX;
    let initialRectWidth;
    
    // Obtain the initial rectangle and mouse status
    function resizeStarted(event) {
      initialMouseX = event.X;
      initialRectX = +rect.attr("x");
      initialRectWidth = +rect.attr("width");
    }
    
    function resized(event) {
        // let minY = initialRectX + 4; // Compute the minimum value of y of the rect
        // let maxY = 1200 - initialRectY - 2; // Compute the maximum value of y of the rect //TODO how?
      
        // Set the new height of the rect
        rect.attr("width", +rect.attr("width") + event.dx);

        // Set the new width of the top and bottom  and the x of the right
        controls.top.attr("width", +rect.attr("width") + event.dx);
        controls.bottom.attr("width", +rect.attr("width") + event.dx);
        controls.right.attr("x", +rect.attr("x") + +rect.attr("width") - 4);
    }
    
    // Always keep the bottom control on bottom
    function resizeEnded(event) {
      //let minY = Math.min(initialRectY + event.y - initialMouseY, initialRectY + initialRectHeight);
      //controlRectBottom.attr("y", minY - 3);
    }
  
    // Attach callback to controlRect
    controls.right.call(d3.drag()
      .on("start", resizeStarted)
      .on("drag", resized)
      .on("end", resizeEnded));
}

function boxClicked(event, index, svg){
    console.log(index);
    let rect = allRects[index].rect;
    let ctrls = allRects[index].controls;

    rect.attr("class", "old");
    ctrls.top.attr("class", "old");
    ctrls.bottom.attr("class", "old");
    ctrls.right.attr("class", "old");
    ctrls.left.attr("class", "old");

    svg.selectAll("rect.old").remove();
    allBoxes[index] = null;

}

function startDrawing(event, svg){
    console.log("starting!");

    let dims = {height: 0, width: 0, thickness: 3, x: event.x, y: event.y};
    
    let rect = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y)
        .attr("width", dims.width)
        .attr("height", dims.height)
        .style("fill", "green")
        .style("opacity", 0.5)
        .style("cursor", "all-scroll");
  
    let controlRectTop = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y - dims.thickness)
        .attr("width", dims.width)
        .attr("height", dims.thickness)  // Set the thickness to 6.
        .style("fill", "black")
        .style("cursor", "ns-resize");

    let controlRectBottom = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y + (dims.height - dims.thickness))
        .attr("width", dims.width)
        .attr("height", dims.thickness)  // Set the thickness to 6.
        .style("fill", "grey")
        .style("cursor", "ns-resize");

    let controlRectRight = svg.append("rect")
        .attr("x", dims.x + dims.width - (dims.thickness))
        .attr("y", dims.y)
        .attr("width", dims.thickness)
        .attr("height", dims.height) 
        .style("fill", "green")
        .style("cursor", "ns-resize");

    let controlRectLeft = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y)
        .attr("width", dims.thickness)
        .attr("height", dims.height)
        .style("fill", "yellow")
        .style("cursor", "ns-resize");

    var controlRects = [controlRectTop, controlRectRight, controlRectBottom, controlRectLeft];
    var ctrls = {top: controlRectTop, right: controlRectRight, bottom: controlRectBottom, left: controlRectLeft};


    addMoveCallbackWithControls(rect, controlRects);
    addResizeCallbacks(rect, ctrls);

    // Add deletion click listener
    let index = allRects.length;
    rect.on("dblclick", function (event) { boxClicked(event, index, svg);});

    // Get data bounds created by this box
    let dateMin = xScale.invert(rect.attr("x"));
    let dateMax = xScale.invert(+rect.attr("x") + (+rect.attr("width")));
    let stMax = yScale.invert(rect.attr("y"));
    let stMin = yScale.invert(+rect.attr("y") + (+rect.attr("height")));
    let bounds = {dateMin: dateMin, dateMax: dateMax, stMin: stMin, stMax: stMax};

    console.log(bounds);

    // Add new brush box to array and collections
    rect.attr("id", index);
    let boxObject = {rect: rect, controls: ctrls, index: index, bounds: bounds};
    allRects.push(boxObject);
    allBoxes[index] = boxObject;
    console.log(allBoxes);

    //d3.select(this).call(d3.drag().on("drag", function (event, d) { resizeRect(event, rect, ctrls);}));
}

function resizeRect(event){
    console.log("resizing");
    let currentBox = allRects[allRects.length - 1];
    let rect = currentBox.rect;
    let controls = currentBox.controls;

    // resize Rect
    rect.attr("width", Math.max(0, event.x - +rect.attr("x")))
        .attr("height", Math.max(0, event.y - +rect.attr("y")));

    // move and resize ControlRects
    controls.top
        .attr("width", +rect.attr("width"))
        .attr("x", rect.attr("x"))
        .attr("y", rect.attr("y"));

    controls.bottom
        .attr("width", +rect.attr("width"))
        .attr("x", rect.attr("x"))
        .attr("y", +rect.attr("y") + +rect.attr("height"));

    controls.left
        .attr("height", +rect.attr("height"))
        .attr("x", rect.attr("x"))
        .attr("y", rect.attr("y"));
    
    controls.right
        .attr("height", +rect.attr("height"))
        .attr("x", +rect.attr("x") + +rect.attr("width"))
        .attr("y", rect.attr("y"));

    currentBox.bounds.dateMin = xScale.invert(rect.attr("x"));
    currentBox.bounds.dateMax = xScale.invert(+rect.attr("x") + (+rect.attr("width")));
    currentBox.bounds.stMax = yScale.invert(rect.attr("y"));
    currentBox.bounds.stMin = yScale.invert(+rect.attr("y") + (+rect.attr("height")));

    console.log(currentBox.bounds);
}

function releaseDrag(event){
    console.log("releasing");
    d3.select(this).call(d3.drag().on("drag", null));
}

function checkFiltering(svg){
    
    let lines = svg.selectAll("data-line");

    let netBoxCount = allRects.length;
    
    // Iterate over boxes, get bounds from all active ones\
    let allBounds = [];

    for (i = 0; i < netBoxCount; i++){
        let box = allBoxes[i];
        if (box == null) continue;

        allBounds.push(box.bounds);
    }

    // If no active boxes to bound data, show all
    if (allBounds.length == 0){
        lines.attr("opacity", 1);
    } else {
        lines.attr("opacity", "0.2");

        lines.filter(function (d) {

            console.log(d);
        }).attr("opacity", 1);
    }




}

function createPlot(rawData, groupedData, svg){

    // Set up details of plot dimensions
    let plotVars = ({
        plotWidth: 1200,   // Width of plot region
        plotHeight: 600,  // Height of plot region
        plotMargin: 80   // Margin space for axes and their labels
    });

    xScale = d3.scaleTime()
    .domain(d3.extent(rawData, r => r.date)) // Min-Max of Date
    .range([0 + plotVars.plotMargin, plotVars.plotWidth - plotVars.plotMargin]);

    yScale = d3.scaleLinear()
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

    // Add rectangle with dragging 
    svg.call(d3.drag()
        .on("start", function (event) {startDrawing(event, svg);})
        .on("end", function (event) { releaseDrag(event); })
        .on("drag", function (event) { resizeRect(event); }));

    
    return svg.node();
}

export {getData, createPlot, addRect};
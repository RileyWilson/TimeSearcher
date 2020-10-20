'use strict';

var allRects = [];
var allBoxes = {};
var xScale;
var yScale;
var mySVG;
var allPeopleObjs = {};

const getData = async() => {

    var data = await d3.csv('lib/data/top_100.csv');

    var allData =[]; 
    let parsetime = d3.timeParse('%Y-%m');
    var groupedData = [];
    var data =  await d3.csv('lib/data/top_100.csv', function(d) {
    return {
        person: d.person,
        date: parsetime(d.year_month),  // parse date string into Date object
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
                           (plotVars.plotHeight - (plotVars.plotMargin /2 )) + ')')
      .style('text-anchor', 'middle')
      .text('Date');

  svg.append('text')
      .attr('y', 0 + (plotVars.plotMargin/3))
      .attr('x', 0 + (plotVars.plotMargin) + 20)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Screentime (sec)');      
}

function addLabels(svg, xScale, yScale, plotVars, groupedData){
    
    // Add title info to graphic
    svg.append("text")
        .attr("fill", "black")
        .attr("font-size", "37")
        .text("TimeSearcher")    
        .attr('transform',
        'translate(' + (plotVars.plotWidth/2) + ' ,' + 
                       (plotVars.plotMargin*0.6) + ')')
        .style('text-anchor', 'middle');
    
    // Add name to graphic
    svg.append("text")
        .attr("fill", "black")
        .attr("font-size", "19")
        .text("Riley Wilson - CS448, Fall 2020")    
        .attr('transform',
            'translate(' + (plotVars.plotWidth/2) + ' ,' + 
                   (plotVars.plotMargin*0.86) + ')')
        .style('text-anchor', 'middle');

    // Add instructions to graphic
    svg.append("text")
    .attr("fill", "black")
    .attr("font-size", "13")
    .attr("font-style", "italic")
    .text("Instructions: Draw boxes to filter. Drag the edges of a box to resize, or drag the whole box to move it. \nDouble click a box to delete it.")    
    .attr('transform',
    'translate(' + (plotVars.plotWidth/2) + ' ,' + 
                   (plotVars.plotHeight * 0.96) + ')')
    .style('text-anchor', 'middle');

    // Add labels of names to each line
    let index = 0;
    groupedData.forEach(e =>{
        let name = e.person;
        allPeopleObjs[name] = index;
        let finalScreentime = e.values[e.values.length - 1].screentime;
        let y = yScale(finalScreentime);

        svg.append("text")
        .attr("fill", "black")
        .attr("stroke", null)
        .attr("stroke-width", 3)
        .attr("x", plotVars.plotWidth - plotVars.plotMargin + 3)
        .attr("y", y)
        .attr("font-size", 10)
        .attr("id", "label-" + index)
        .attr("class", "name-label")
        .text(name);
        index++;
    })
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
        
        controlRects.forEach( e => {
            e.attr("x", +e.attr("x") + event.dx)  // Shift the x value by event.dx
            .attr("y", +e.attr("y") + event.dy);   // Shift the y value by event.dy
        });

        //get rect from array
        updateRectBounds(rect);
    }
  
    // Attach callback to rect
    rect.call(d3.drag()
      .on("drag", moved));
}

function addResizeCallbackTop(rect, controls) {
    
    function resized(event) {
        rect.attr("y", +rect.attr("y") + event.dy)            // set the new y of the rect
            .attr("height", +rect.attr("height") - event.dy); // set the new height of the rect

        // Set the new height of the side controls
        controls.left.attr("y", +rect.attr("y") + event.dy).attr("height", +rect.attr("height") + event.dy); // set the new height and y of the rect
        controls.right.attr("y", +rect.attr("y") + event.dy).attr("height", +rect.attr("height") + event.dy); // set the new height and yof the rect
        controls.top.attr("y", +rect.attr("y")); // Set the new y of the control

        updateRectBounds(rect);
    }
    
    // Attach callback to controlRect
    controls.top.call(d3.drag()
      .on("start", null)
      .on("drag", resized)
      .on("end", null));
}

function addResizeCallbackBottom(rect, controls) {
    
    function resized(event) {
        // Set the new height of the rect
        rect.attr("height", +rect.attr("height") + event.dy);

        // Set the new height of the side and controls
        controls.left.attr("height", +rect.attr("height") + event.dy);
        controls.right.attr("height", +rect.attr("height") + event.dy); 
        controls.bottom.attr("y", +rect.attr("y") + +rect.attr("height") - 4);

        updateRectBounds(rect);
    }
    
    // Attach callback to controlRect
    controls.bottom.call(d3.drag()
      .on("start", null)
      .on("drag", resized)
      .on("end", null));
}

function addResizeCallbackLeft(rect, controls) {
    
    function resized(event) {
        rect.attr("x", +rect.attr("x") + event.dx)            // set the new x of the rect
            .attr("width", +rect.attr("width") - event.dx); // set the new width of the rect

        // Set the new width and x of the left and top and bottom controls
        controls.top.attr("x", +rect.attr("x") + event.dx).attr("width", +rect.attr("width") + event.dx); 
        controls.bottom.attr("x", +rect.attr("x") + event.dx).attr("width", +rect.attr("width") + event.dx);
        controls.left.attr("x", +rect.attr("x")); // Set the new x of the control

        updateRectBounds(rect);
    }
  
    // Attach callback to controlRect
    controls.left.call(d3.drag()
      .on("start", null)
      .on("drag", resized)
      .on("end", null));
}

function addResizeCallbackRight(rect, controls) {
    
    function resized(event) {
        // Set the new height of the rect
        rect.attr("width", +rect.attr("width") + event.dx);

        // Set the new width of the top and bottom  and the x of the right
        controls.top.attr("width", +rect.attr("width") + event.dx);
        controls.bottom.attr("width", +rect.attr("width") + event.dx);
        controls.right.attr("x", +rect.attr("x") + +rect.attr("width") - 4);

        updateRectBounds(rect);
    }
  
    // Attach callback to controlRect
    controls.right.call(d3.drag()
      .on("start", null)
      .on("drag", resized)
      .on("end", null));
}

function boxClicked(event, index, svg){
    let rect = allRects[index].rect;
    let ctrls = allRects[index].controls;

    rect.attr("class", "old");
    ctrls.top.attr("class", "old");
    ctrls.bottom.attr("class", "old");
    ctrls.right.attr("class", "old");
    ctrls.left.attr("class", "old");

    svg.selectAll("rect.old").remove();
    allBoxes[index] = null;

    checkFiltering(); // Update filtering for deleted box
}

function updateRectBounds(rect){
    let index = rect.attr("id");
    let currentBox = allBoxes[index];
    currentBox.bounds.dateMin = xScale.invert(rect.attr("x"));
    currentBox.bounds.dateMax = xScale.invert(+rect.attr("x") + (+rect.attr("width")));
    currentBox.bounds.stMax = yScale.invert(rect.attr("y"));
    currentBox.bounds.stMin = yScale.invert(+rect.attr("y") + (+rect.attr("height")));

    checkFiltering();
}

function startDrawing(event, svg){
    let dims = {height: 0, width: 0, thickness: 3, x: event.x, y: event.y};
    
    let rect = svg.append("rect")
        .attr("x", dims.x)
        .attr("y", dims.y)
        .attr("width", dims.width)
        .attr("height", dims.height)
        .style("fill", "blue")
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

    // Add new brush box to array and collections
    rect.attr("id", index);
    let boxObject = {rect: rect, controls: ctrls, index: index, bounds: bounds};
    allRects.push(boxObject);
    allBoxes[index] = boxObject;
}

function resizeRect(event){
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

    updateRectBounds(rect);
}

function releaseDrag(event){
    d3.select(this).call(d3.drag().on("drag", null));
}

function checkFiltering(){
    
    let svg = mySVG;
    let lines = svg.selectAll("path.data-line");
    var filteredLines = lines;

    // Grey out all lines and labels to start
    lines.style("opacity", 0.2);
    d3.selectAll(".name-label").attr("opacity", 0.2);

    // Iterate over boxes, turn off all lines that dont pass through
    let anyBoxes = false;
    for (var i = 0; i < allRects.length; i++){
        let box = allBoxes[i];
        if (box == null) continue;
        anyBoxes = true;

        let bounds = box.bounds;

        filteredLines = filteredLines.filter(function (d) {
            let data = d.values;

            for (var j = 0; j < data.length; j++){
                let e = data[j];
                if ((e.date >= bounds.dateMin) && (e.date <= bounds.dateMax)){
                    if ( (e.screentime < bounds.stMin) || (e.screentime > bounds.stMax)){
                        return false; // should false becuase we want to filter it out
                    }
                }
            }

            return true; // it successfully satisfies this filter box
        });
    }

    if (!anyBoxes){                 // Bring back full opacity for all lines and labels
        lines.style("opacity", 1);
        d3.selectAll(".name-label").attr("opacity", 1);
    } else {                        // Bring back full opacity for selected lines and their labels
        filteredLines.each(l => {
            let label = "#label-" + allPeopleObjs[l.person] + ".name-label";
            d3.select(label).attr("opacity", 1).raise();
        });
        filteredLines.style("opacity", 1);
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


    // Add Axes and Labels
    addAxes(svg, xScale, yScale, plotVars);

    // Add labels for each line
    addLabels(svg, xScale, yScale, plotVars, groupedData);

    // Add rectangle with dragging 
    svg.call(d3.drag()
        .on("start", function (event) {startDrawing(event, svg);})
        .on("end", function (event) { releaseDrag(event); })
        .on("drag", function (event) { resizeRect(event); }));

    mySVG = svg;
    return svg.node();
}

export {getData, createPlot};
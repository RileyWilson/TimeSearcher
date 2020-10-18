'use strict';
import * as lib from './lib/lib.js'

const myFunction = async (params) => {

    // load in the csv data
    //var data = await d3.csv('https://rileywilson.github.io/TimeSearcher/lib/data/top_100.csv');

    let [rawData, groupedData] = await lib.getData();
    //console.log(rawData);
    //console.log(groupedData);
    let newSVG = d3.select("body").append("svg");
    lib.createPlot(rawData, groupedData, newSVG);
    //lib.addRect(newSVG);
    //return plotWithRect;

    /*
    console.log(plot);

    for (var i = 0; i < newData.length; i++) {
        console.log(newData[i].person);
    }


    var items = ol.selectAll('li').data(data).join(
        enter  => enter.append('li'),
        update => update, 
        exit   => exit.remove() )
            .text(d => `${d.person}`);
    
    ol.selectAll('li') // select all list elements (orange circle above)
        .data(data)  // bind all our data values (blue circle above)
        .join(
          enter  => enter.append('li'), // append an li element for each entering item
          update => update,             // do nothing with items that match an existing element
          exit   => exit.remove()       // remove li elements whose backing data is now gone
        ).text(d => `${d.person}`);
    
     return ol.node();*/
}

myFunction();
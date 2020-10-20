'use strict';
import * as lib from './lib/lib.js'

const myFunction = async (params) => {
    
    let [rawData, groupedData] = await lib.getData();
    let newSVG = d3.select("body").append("svg");
    lib.createPlot(rawData, groupedData, newSVG);
}

myFunction();
'use strict';
import * as lib from 'https://rileywilson.github.io/TimeSearcher/lib/lib.js'

const myFunction = async(params) => {

    // load in the csv data
    var data = await d3.csv('https://rileywilson.github.io/TimeSearcher/lib/data/top_100.csv');


    var newData = lib.getData();
    
    for (var i = 0; i < data.length; i++) {
        console.log(data[i].person);
    }

    /*let ol = d3.create('ol');
  

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
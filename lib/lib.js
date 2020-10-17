'use strict';

const getData = async(params) => {

    // load in the csv data
    var data = await d3.csv('https://rileywilson.github.io/TimeSearcher/lib/data/top_100.csv');

    /*
    for (var i = 0; i < data.length; i++) {
        console.log(data[i].person);
    }
    */

   let parsetime = d3.timeParse('%y-%m');
   var data = d3.csv('https://rileywilson.github.io/TimeSearcher/lib/data/top_100.csv', function(d) {
    return {
      person: d.person,
      date: parsetime(d.year_month),/* Fill in */ // We need to parse the date string into a Date object using d3.timeParse. Here, the string looks like 10/15/19 (%m/%d/%y).
      screentime: +d.screentime_seconds
    };
  }).then(function(rawData) {
    //Outside of Observable notebooks you would put all code to draw the graph here.
    return rawData;
  });


    //let ol = d3.create('ol');
  

   /* var items = ol.selectAll('li').data(data).join(
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
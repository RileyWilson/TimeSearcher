'use strict';

function myFunction() {
    var data = d3.csv('./lib/data/top_100.csv');

    for (var i = 0; i < data.length; i++) {
        console.log(data[i].Name);
        console.log(data[i].Age);
    }

    let ol = d3.create('ol');
  

    var items = ol.selectAll('li').data(data).join(
        enter  => enter.append('li'),
        update => update, 
        exit   => exit.remove() )
            .text(d => `${d.person}`);
    
    /*ol.selectAll('li') // select all list elements (orange circle above)
        .data(data)  // bind all our data values (blue circle above)
        .join(
          enter  => enter.append('li'), // append an li element for each entering item
          update => update,             // do nothing with items that match an existing element
          exit   => exit.remove()       // remove li elements whose backing data is now gone
        ).text(d => `${d.person}`);
    //return ol.node(); */
    

    var bitch = d3.select("bitch");
    bitch.style("color", "green");
    console.log("hey bitch");
    document.getElementById("bitch").textContent = "U suk";
}

myFunction();
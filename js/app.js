// Width and height of SVG
 var width = 960,
     height = 500;

 // Define map projection for Nepal
 var projection = d3.geo.albers()
                    .center([87, 28])
                    .rotate([-85, 0])
                    .parallels([27, 32]);

 // Define path generator
 var path = d3.geo.path()
              .projection(projection);

 //Define quantize scale to sort data values into buckets of color
 var color = d3.scale.quantize()
               .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

 //Colors taken from colorbrewer.js, included in the D3 download

 // Create SVG element
 var svg = d3.select("#chart")
             .append("svg")
             .attr("width", width)
             .attr("height", height);

 svg.append("rect")
    .attr("width", width)
    .attr("height", height);

var  label = svg.append("text").attr("x", "780").attr("y", "30").text("NEPAL")
 
 var g = svg.append("g");

svg2  = d3.select("#chart")
             .append("svg")
             .attr("class", "chart");
svg3  = d3.select("#chart")
             .append("svg")
             .attr("class", "chart");
function barChart(dsvg, barData, names){
        
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 370 - margin.left - margin.right,
    height = 260 - margin.top - margin.bottom;
    var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);
var y = d3.scale.linear()
    .range([height, 0]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    x.domain(names);

y.domain([0, d3.max(barData)]);

  var barWidth = x.rangeBand();
  var chart = dsvg.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  chart.selectAll(".bar")
      .data(barData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d,i) { return x(names[i]); })
      .attr("y", function(d) { return y(d); })
      .attr("height", function(d) { return height - y(d); })
      .attr("width", barWidth)
      .append("text").text(function(d){ return d;});
    chart.selectAll(".barText").data(barData).enter().append("text")
    .attr("class", "barText")
    .attr("x", function(d, i) { return x(names[i])+40; })
    .attr("y", 175)
    .attr("dy", ".35em")
    .text(function(d) { return d; });
}
function refreshSVG(dsvg, refresh){
    if(refresh){
        
        dsvg.remove();
      dsvg =  d3.select("#chart")
             .append("svg")
             .attr("class", "chart")
    }
    return  dsvg;
}
function showPopulation(data, label){
    d3.select("#population").select("p").remove();
    var p = d3.select("#population").append("p").data(data);
    var pop = data[0]['Total Population'];
    if (label == 'Nepal'){
        pop = d3.sum(data, function(d){ return d['Total Population']});
    }
    p.text(label+", Total Population: "+pop)
}
function deathChart(data, isNew){
      svg2 = refreshSVG(svg2, isNew);
svg2.append("text").attr("x", "250").attr("y", "15").text("Casualty")
    var totalDeath = d3.sum(data, function(d) { return d['Total Death']; });
   var maleDeath = d3.sum(data, function(d) { return d['Death Male']; });
   var femaleDeath = d3.sum(data, function(d) { return d['Death Female']; });
   var unknownDeath = d3.sum(data, function(d) { return d['Death Unknown']; });
   var names =['Total', 'Male', 'Female', 'Unknown']
   var barData = [totalDeath, maleDeath, femaleDeath, unknownDeath]
   barChart(svg2, barData, names);
}
function injuryChart(data, isNew){
    svg3 = refreshSVG(svg3, isNew);
svg3.append("text").attr("x", "250").attr("y", "15").text("Injury")
var totalDeath = d3.sum(data, function(d) { return d['Total Injured']; });
   var maleDeath = d3.sum(data, function(d) { return d['Injured Male']; });
   var femaleDeath = d3.sum(data, function(d) { return d['Injured Female']; });
   var names =['Total', 'Male', 'Female']
   var barData = [totalDeath, maleDeath, femaleDeath]
   barChart(svg3, barData, names);    
}

 //Load in agriculture data
 d3.csv("../data/calamity.csv", function(data) {

      //Set input domain for color scale
   color.domain([
           d3.min(data, function(d) { return d['Total Death']; }),
           d3.max(data, function(d) { return d['Total Death']; })
   ]);
   deathChart(data, false);
   injuryChart(data, false);
   showPopulation(data, "Nepal");
   
   // Read topojson data and create the map
   d3.json("../data/nepal-districts.topo.json", function(error, nepal) {
     if(error) return console.error(error);

     var districts = topojson.feature(nepal, nepal.objects.districts);

     projection
       .scale(1)
       .translate([0, 0]);

     var b = path.bounds(districts),
         s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
         t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

     projection
       .scale(s)
       .translate(t);

      //Merge the population data and Topojson
      //Loop through once for each district
      for (var i = 0; i < data.length; i++) {

              //Grab state name
        var dataDistrict = data[i].District
                                  .toLowerCase()
                                  .replace(/^\s+|\s+$/g, "");
        //console.log("Data:" + dataDistrict)

              //Grab data value, and convert from string to float
        var dataPopulation = parseFloat(data[i]['Total Death']);
        //var dataArea =  parseFloat(data[i].GeographicalArea);
        //Console.log("Population:" + dataPopulation)

              //Find the corresponding state inside the GeoJSON
              for (var j = 0; j < districts.features.length; j++) {

                var jsonDistrict = districts.features[j].properties.name
                                            .toLowerCase()
                                            .replace(/^\s+|\s+$/g, "");
                    
                // console.log("Json:" + jsonDistrict)
                //console.log("comparison: " + dataDistrict + " "  + jsonDistrict)

                      if (dataDistrict == jsonDistrict) {

                              //Copy the data value into the JSON for choropleth
                              districts.features[j].properties.value = dataPopulation;
                              //console.log("Output:" +  districts.features[j].properties.value)
               

                              //Get rest of the values to show
                              //districts.features[j].properties.Area = dataArea;

                              //Stop looking through the JSON
                              break;

                      }
              }
      }


     g.selectAll(".districts")
      .data(districts.features)
      .enter()
      .append("path")
      .attr("class", function(d) { return "districts"; })
      .attr("d", path)
      .style("fill", function(d) {
            //Get data value
            var value = d.properties.value;

            if (value) {
                    //If value exists…
                    return color(value);
            } else {
                    //If value is undefined…
                    return "#ddd";
            }
        })
      .on("mouseover", function(d) {
           //Get this bar's x/y values, then augment for the tooltip
           var xPosition = parseFloat(event.pageX+30);
           var yPosition = parseFloat(event.pageY-20);
           //Update the tooltip position and value
           d3.select("#tooltip")
             .style("left", xPosition + "px")
             .style("top", yPosition + "px");
           d3.select("#tooltip #heading")
             .text(d.properties.name);
             label.text(d.properties.name);
           // d3.select("#tooltip #area")
             // .text("Area:   " + d.properties.Area + " sq. km");
           // d3.select("#tooltip #population")
             // .text("Population:   " + (d.properties.value/100000).toFixed(1) + " lakh");



           // //Show the tooltip
           d3.select("#tooltip").classed("hidden", false);

           d3.select(this.parentNode.appendChild(this))
            //.transition()
            //.duration(100)
             .style({'stroke-width':1,'stroke':'#333','stroke-linejoin':'round',
                     'stroke-linecap': 'round', 'cursor':'pointer'});
       })
       .on("mouseout", function() {
            //Hide the tooltip
            d3.select("#tooltip").classed("hidden", true);
            label.text("NEPAL");

            d3.select(this.parentNode.appendChild(this))
           //.transition()
           //.duration(50)
           .style({'stroke-width':1,'stroke':'#FFFFFF','stroke-linejoin':'round', 'stroke-linecap': 'round' });
       })
       .on("click", function(d){
           label.text(d.properties.name);
           //d3.select("tr#human").selectAll("td").remove();
               var stat = d3.select("#stat");
               var human;
           for (var i = 0; i < data.length; i++) {
            if(d.properties.name.toLowerCase() == data[i].District.toLowerCase()){
               human = data[i];
               break;
            }
           }
           if(human){
               deathChart([human], true);
               injuryChart([human], true);
               showPopulation([human], human.District);
       }
       });

      // For cleaner borders
      g.append("path")
       .datum(topojson.mesh(nepal, nepal.objects.districts, function(a, b) { return a !== b;}))
       .attr("class", "district-boundary")
       .attr("d", path);
    });
 });

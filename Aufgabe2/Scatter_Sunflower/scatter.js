const containerSize = 600;
//Style des slider für aktuelle container größe
var sliderValue = document.getElementById('mySlider').value;
document.getElementById("mySlider").style.width = (containerSize / 2);
document.getElementById("mySlider").style.marginLeft = (containerSize / 4);
//document.getElementById("SliderText").style.marginLeft = (containerSize / 2);
//document.getElementById('SliderText').textContent = sliderValue;
var dataset = [];
var radius = 4;
color = "white";

var margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = containerSize - margin.left - margin.right,
    height = containerSize - margin.top - margin.bottom;

//Für berechnung der x und y achsen
const MAX_PIXEL_X = containerSize - margin.left;
const MAX_PIXEL_Y = containerSize - margin.top;

//setzung der svg attribute
var svg = d3.select('#svg1')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "ebene");


//xaxis skalieren
var xscale = d3.scaleLinear()
    .domain([0, 100])
    .range([margin.left, width + margin.right]);

xaxis = svg.append("g")
    .attr("transform",
        "translate(" + 0 + "," + (height + margin.top) + ")")
    .call(d3.axisBottom(xscale))
    .attr("color", color);

//yaxis skalieren
var yscale = d3.scaleLinear()
    .domain([0, 100])
    .range([height + margin.bottom, margin.top]);

yaxis = svg.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + 0 + ")")
    .call(d3.axisLeft(yscale))
    .attr("color", color);

drawCircle(xscale, yscale, dataset);


//update funktion die aufgerufen wird beim slider benutzen
function UpdateAxis(Value) {
    var xscaleNeu = d3.scaleLinear()
        .domain([0, Value])
        .range([margin.left, width + margin.right]);
    xaxis
        .call(d3.axisBottom(xscaleNeu))
        .attr("color", color);

    var yscaleNeu = d3.scaleLinear()
        .domain([0, Value])
        .range([height + margin.bottom, margin.top]);
    yaxis
        .call(d3.axisLeft(yscaleNeu))
        .attr("color", color);

    drawCircle(xscaleNeu, yscaleNeu, dataset);

}

//Do something when slider
d3.select("#mySlider").on("change", function (d) {
    sliderValue = this.value
    dots.remove();
    UpdateAxis(sliderValue);
    //document.getElementById('SliderText').textContent = sliderValue;
})

svg.on('click', function () {
    var coords = d3.mouse(this);
    addCircle(coords[0], coords[1]);
    //dots werden removed und nochmal durch updateaxis gezeichnet, sodass alle neuen Punkte von der sliderskallierung betroffen sind
    //Sonst würde nur der zuletzt hinzugefüge Punkt verändert werden
    CurrentValue = document.getElementById('mySlider').value
    dots.remove();
    UpdateAxis(CurrentValue);

});

function addCircle(x, y) {
    //Maus cords vor umrechnung (in Pixel)
    //console.log(x, y);

    //Konvertiert Wert von svgkoordinaten zu fiktiver Skala 
    x = (x - margin.left) * sliderValue / (MAX_PIXEL_X - margin.left);
    //Spiegelverkehrte Konvertierung für y achse
    y = (y - MAX_PIXEL_Y) * sliderValue / (margin.top - MAX_PIXEL_Y);
    dataset.push({ x: x, y: y })

    //console.log(dataset);
    //neue coords in angezeigtem coordsystem
    //console.log(x, y);
}

function drawCircle(xscale, yscale, circles) {
    dots = svg.selectAll("circle")
        .data(circles)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xscale(d.x) })
        .attr("cy", function (d) { return yscale(d.y) })
        .attr("fill", "red")
        .attr("r", radius);
}





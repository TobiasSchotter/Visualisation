const containerSize = 600;
var sliderValue = document.getElementById('mySlider').value;
//Anpassung der sliderbreite inabhängigkeit der containerSize 
document.getElementById("mySlider").style.width = (containerSize / 2);
document.getElementById("mySlider").style.marginLeft = (containerSize / 4);
//document.getElementById("SliderText").style.marginLeft = (containerSize / 2);
//document.getElementById('SliderText').textContent = sliderValue;

var dataset = [];
var radius = 4;
color = "white";
var coordarr = [];

//Margins des graphen werden festgelegt
//Bei drastischer änderung der containersize müssten diese eventuell auch angepasst werden, sodass Proportionen stimmen
var margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = containerSize - margin.left - margin.right,
    height = containerSize - margin.top - margin.bottom;
const MAX_PIXEL_X = containerSize - margin.left;
const MAX_PIXEL_Y = containerSize - margin.top;

//Auswahl des svg containers
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



//Updatefunktion die aufgerufen wird bei jedem click und slider benutzens
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

    //Forschleife durch alle daten und für jeden Eintrag wird nochmal durchgegangen und verglichen ob es die gleichen Koordinaten nochmal gibt
    //Für jedes zutreffen dieser bedingung wird der counter hochgezählt 
    for (var i = 0; i < dataset.length; i++) {
        let punktecount = 0;
        for (var j = 0; j < dataset.length; j++) {
            if ((dataset[i].y == dataset[j].y) && (dataset[i].x == dataset[j].x)) { punktecount++; }

        }
        drawLines((xscaleNeu(dataset[i].x)), (yscaleNeu(dataset[i].y)), punktecount)

    }
    console.log(dataset);
}
//funktionsaufruf beim benutzen des sliders
d3.select("#mySlider").on("change", function (d) {
    sliderValue = this.value
    dots.remove();
    svg.selectAll("line")
        .remove();
    UpdateAxis(sliderValue);

})
//on click funktion
svg.on('click', function () {
    var coords = d3.mouse(this);
    addCircle(coords[0], coords[1]);
    CurrentValue = document.getElementById('mySlider').value
    dots.remove();
    svg.selectAll("line")
        .remove();
    UpdateAxis(CurrentValue);

});

function addCircle(x, y) {
    //Maus cords vor umrechnung (in Pixel)
    //console.log(x, y);

    //Konvertiert Wert von fiktiver Skala 
    x = (x - margin.left) * sliderValue / (MAX_PIXEL_X - margin.left);
    //Spiegelverkehrte Konvertierung
    y = (y - MAX_PIXEL_Y) * sliderValue / (margin.top - MAX_PIXEL_Y);
    dataset.push({ x: x, y: y })

    //console.log(dataset);
    //neue coords in angezeigtem coordsystem
    //console.log(x, y);
}
//Databinding für Punkte
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

function drawLines(circleX, circleY, lineAnzahl) {

    //Berechnung der End X und Y punkte der Linien. 
    if (lineAnzahl > 1) {
        var cx = circleX
        var cy = circleY
        var r = 12
        //Linienanzahl wird vor dem Funktionsaufruf ermittelt und übergeben
        var angle = 2 * Math.PI / lineAnzahl
        var radialPoints = []
        //Berechnung der Winkel zwischen den Linien
        for (var k = 0; k < lineAnzahl; k++) {
            var x2 = (r * Math.cos(angle * k) + cx)
            var y2 = (r * Math.sin(angle * k) + cy)
            radialPoints.push([x2, y2])
        }

        //Databinding für Sunflower Linien
        lines = svg.selectAll("lines")
            .remove()
            .data(radialPoints)
            .enter()
            .append("line")
            .attr("x1", cx)
            .attr("y1", cy)
            .attr("x2", function (d) { return d[0] })
            .attr("y2", function (d) { return d[1] })
            .attr("stroke", "white")
            .attr('stroke-width', 1.5)
            .exit()
            .remove();

    }
}
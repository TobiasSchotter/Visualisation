var graph;
var nodes;
graph = new Graph();
const width = 650
const height = 600
const radius = (Math.min(width, height) / 2) - 10;
//globale variable um console.logs zu aktivieren oder deaktivieren 
const logging = true;


function Graph() {
  this.nodes = [];
  this.graph = {};
}

//Prototype Funktion um dem graph nodes beizufügen
Graph.prototype.addNode = function (n) {
  this.nodes.push(n);
  var name = n.name;
  this.graph[name] = n;
}

//Prototype Funktion um nodes edges beizufügen also adjazente Knoten
Node.prototype.addEdge = function (neighbor) {
  this.edges.push(neighbor);
  //both directions
  //neighbor.edges.push(this);
}

Graph.prototype.setStart = function (Name) {
  this.start = this.graph[Name];
  return this.start;
}

Graph.prototype.setEnd = function (Name) {
  this.end = this.graph[Name];
  return this.end;
}

function Node(name, size, parent) {
  this.name = name;
  this.size = size;
  this.edges = [];
  //Mit momentaner Lösung unnötig, da jeder Knoten bei diesem graphen nur einmal besucht werden kann
  this.searched = false;
  this.startangle = 0;
  this.endangle = 0;
  this.parent = parent;

  // add parent if one exists to current node
  if (parent) {
    parent.addEdge(this);

    //Berechnung der Start und Endwinkel manuell. Gespeichert in nodes
    if (parent.offset) {
      this.startangle = parent.offset;
      this.offset = this.startangle;
      this.endangle = (parent.MaxValue * (this.size / parent.size)) + this.startangle;
      parent.offset = this.endangle;
      this.MaxValue = (parent.MaxValue * this.size / parent.size);

    }
    else {
      if (parent.edgeoffset) {
        this.startangle = parent.edgeoffset;
        this.offset = this.startangle;
      }
      else {
        this.startangle = 0;
        //Bei genau 0 kommt es zu einer falschen Rechnung
        this.offset = 0.00000000001;

      }
      this.endangle = (2 * (this.size / parent.size)) + this.startangle;
      parent.edgeoffset = this.endangle;
      this.MaxValue = (2 * this.size / parent.size);
    }
  }
}
//Funktion zu erstellung neuer nodes. Fügt die nodes anschließend dem graph hinzu
function nodeData(arr, parent) {
  for (const [i, obj] of arr.entries()) {

    //Setzten der Size auf 0 wenn es keinen size Eintrag in der Data gibt
    let currentNode = new Node(obj.name, obj.size ? obj.size : 0, parent)
    //add currentNode to graph
    graph.addNode(currentNode);

    //wenn child vorhanden und childtype = "object" rekursiver Aufruf mit dem jetztgen node als parent
    if (obj.children && typeof obj.children == "object") {
      nodeData(obj.children, currentNode);
    }
  }
}

nodeData(data, undefined);

//Breitensuche
function bfs(start, end) {
  var queue = [];
  //Prototype Funktion wird aufgerufen und setzt start und ende 
  var startKnoten = graph.setStart(start);
  var endKnoten = graph.setEnd(end);

  startKnoten.searched = true;
  queue.push(startKnoten);


  while (queue.length > 0) {
    //Erstes Element in queue als current und löschen des Elements in queue
    var current = queue.shift();

    //adjazente knoten des momentanen knotens
    var edges = current.edges;


    for (var i = 0; i < edges.length; i++) {
      var neighbor = edges[i];
      //console.log(neighbor.name)
      //statt besuchteKnotenliste werden besuchte knoten mit 'searched' makiert
      if (!neighbor.searched) {
        neighbor.searched = true;
        neighbor.parent = current;

        queue.push(neighbor);
      }
      if (neighbor == endKnoten) {
        //console.log("Found " + neighbor.name);
        queue = [];
        break;
      }
    }
  }
  //reverse search. 
  var path = [];
  path.push(endKnoten);
  var next = endKnoten.parent;

  //bis zum start (oberordner == undefined)
  while (next) {
    path.push(next);
    next = next.parent;
  }

  let message = "";
  for (var i = path.length - 1; i >= 0; i--) {
    message += path[i].name
    //Kein Pfeil nach letztem Element in Path
    if (i > 0) {
      message += ' ----> '
    };
  }
  //Message wird beim mouseover gesetzt
  document.getElementById("breitensuche").textContent = message;
}
if (logging)
  console.log(graph);



//Berechnung für arc()
var x = d3.scale.linear()
  .range([0, 2 * Math.PI]);
var y = d3.scale.sqrt()
  .range([0, radius]);

//http://bl.ocks.org/aaizemberg/78bd3dade9593896a59d categorical colors
var color = d3.scale.category10();

var partition = d3.layout.partition()
  .value(function (d) { return d.size; });


//Berechnung von startAngle, endAngle, innerRadius, outerRadius zum zeichen
var arc = d3.svg.arc()
  .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
  .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
  .innerRadius(function (d) { return Math.max(0, y(d.y)); })
  .outerRadius(function (d) { return Math.max(0, y(d.y + d.dy)); });


//Erstellung von svg container
var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

//zeichen des Diagramms mit d3 databinding
svg.append("g")
  .selectAll("path")
  .data(partition.nodes(data[0]))
  .enter().append("path")
  .attr("d", arc)
  .style("fill", function (d) { return d.type == "file" ? "grey" : color((d.children ? d : d.parent).name) })
  .on("click", click)
  .on("mouseover", WhileMouseOver)
  .on("mouseout", WhileMouseOut)
  //Text beim mouseover der einzelnen Elemente
  .append("title")
  .text(function (d) { return d.name + "\n" + d.value + " bytes"; });

//Funktion für Interaktivität beim click
function click(d) {
  svg.transition()
    .duration(500)
    .tween("scale", function () {
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, 1]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
    })
    .selectAll("path")
    .attrTween("d", function (d) { return function () { return arc(d); }; });
}
//Funktion für das Anzeigen der Breitensuche. Setzt die ausgewählte Node(mouseover) als Ende der Breitensuche
function WhileMouseOver(d) {
  bfs("OberOrdner", d.name)
}
//Funktion zum resetten der Breitensuchanzeige 
function WhileMouseOut() {
  document.getElementById("breitensuche").textContent = "Breitensuche beim MouseOver";
}




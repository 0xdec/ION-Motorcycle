var mm = function(inch) {
  return inch * 25.4;
};
var tireDiameter = function(wheel) {
  return wheel.rim.OD + (wheel.tire.width * wheel.tire.ratio * 2);
};
var tireRadius = function(wheel) {
  return tireDiameter(wheel) / 2;
};

const WHEELBASE = 1400;
const SEAT_HEIGHT = 800;
const BAR_WIDTH = 600;
const RAKE = 24;
//const TRAIL = 100;

const CLEARANCE = 200;
const STANCE = RAKE / 3;
const FRONT_TRAVEL = 120;
const REAR_TRAVEL = 120;

const FORK_LENGTH = 700;
const FORK_DIAM = 41;
const FORK_SPACING = 200;

const TRIPLE_TREE_SPACING = 150;
const MIRROR = 75;

const FRONT_WHEEL = {
  rim: {
    ID: mm(15),
    OD: mm(17),
    width: mm(3)
  },
  tire: {
    width: 110,
    ratio: 0.70
  }
};
const REAR_WHEEL = {
  rim: {
    ID: mm(15),
    OD: mm(17),
    width: mm(3.5)
  },
  tire: {
    width: 130,
    ratio: 0.80
  }
};

// Calculate tire diameters
FRONT_WHEEL.tire.OD = tireDiameter(FRONT_WHEEL);
REAR_WHEEL.tire.OD = tireDiameter(REAR_WHEEL);

const BATTERY_CELLS_X = 8;
const BATTERY_CELLS_Y = 16;
const BATTERY_CELLS_Z = 2;



if (!SVG.supported) {
  alert('SVG not supported');
}

var draw = SVG('drawing');
draw.size(draw.parent().style.width, draw.parent().style.height);
draw.viewbox(0, 0, WHEELBASE * 2, SEAT_HEIGHT * 2);

// Sub-pixel offset fix
SVG.on(window, 'resize', function() { draw.spof(); });

draw.on('mousedown', function(event) {
  // store start values
  this.remember('start', {
    x: event.pageX,
    y: event.pageY,
    viewbox: this.viewbox()
  });
});

draw.on('mousemove', function(event) {
  if (this.remember('start')) {
    // add delta values
    var box = this.remember('start').viewbox;
    var x = box.x - (event.pageX - this.remember('start').x);
    var y = box.y - (event.pageY - this.remember('start').y);

    this.viewbox(x, y, box.width, box.height);
  }
});

draw.on('mouseup', function(event) {
  this.forget('start');
});

// Create a white background
var background = draw.rect(draw.viewbox().width, draw.viewbox().height).fill('#fff').stroke('#000');



var grid = draw.group();
grid.rect(draw.viewbox().width, draw.viewbox().height).x(-draw.viewbox().width / 2).opacity(0);

grid.axes = function(xmin, xmax, ymin, ymax) {
  var group = draw.defs().group();

  group.line(xmin, 0, xmax, 0).stroke('#f00');
  group.line(0, ymin, 0, ymax).stroke('#0f0');
  group.circle(1).center(0, 0).fill('#00f');

  return group;
};

// A rim and tire
grid.wheel = function(wheel) {
  var group = draw.group();

  group.circle(wheel.tire.OD).center(0,0).fill({
    color: '#333'
  }).stroke({
    color: '#000',
    width: 5
  });

  group.circle(wheel.rim.OD).center(0,0).fill({
    color: '#fff'
  }).stroke({
    color: '#000',
    width: 2
  });

  return group;
};

// Front wheel fork
/*fork = function(length, diameter, travel) {
  cylinder(length, d = diameter, center = true);
};*/

// Bar-end mirror
/*mirror = function(diameter) {
  cylinder(5, d = diameter, center = true);
};*/

// Print some data
console.log("Front Tire Diameter: " + FRONT_WHEEL.tire.OD + "mm");
console.log("Rear Tire Diameter: " + REAR_WHEEL.tire.OD + "mm");



grid.wheel(FRONT_WHEEL).move(-WHEELBASE/2, tireRadius(FRONT_WHEEL));
grid.wheel(REAR_WHEEL).move(WHEELBASE/2, tireRadius(REAR_WHEEL));

grid.x(draw.viewbox().width / 2);
grid.scale(1, -1);

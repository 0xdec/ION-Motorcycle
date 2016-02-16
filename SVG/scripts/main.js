var mm = function (inch) {
  return inch * 25.4;
};
var diameter = function (wheel) {
  return wheel.rim.OD + (wheel.tire.width * wheel.tire.ratio * 2);
};
var radius = function (wheel) {
  return diameter(wheel) / 2;
};

const WHEELBASE = 1400;
const SEAT_HEIGHT = 800;
const BAR_WIDTH = 600;
const CLEARANCE = 200;

const RAKE = 24;
//const TRAIL = 100;
const STANCE = RAKE / 3;

const FORK = {
  length: 700,
  diameter: 41,
  spacing: 200,
  travel: 120,
  tripleTree: 150
};

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
FRONT_WHEEL.tire.OD = diameter(FRONT_WHEEL);
REAR_WHEEL.tire.OD = diameter(REAR_WHEEL);

const BATTERY = {
  diameter: 18,
  length: 65,
  diameterTot: 20,
  lengthTot: 75,
  x3D: 16,
  y3D: 8,
  z3D: 2
};



var rakeSIN = Math.sin(RAKE*(Math.PI/180));
var rakeCOS = Math.cos(RAKE*(Math.PI/180));
var rakeTAN = Math.tan(RAKE*(Math.PI/180));

const plane = {
  width: WHEELBASE * 2,
  height: SEAT_HEIGHT * 2,
  gridX: WHEELBASE / 20,
  gridY: SEAT_HEIGHT / 10,
  fontSize: 36
};
const origin = {
  x: plane.width / 2,
  y: 0
};

if (!SVG.supported) {
  alert('SVG not supported');
}

var canvas = SVG('drawing');
canvas.size(
  canvas.parent().style.width,
  canvas.parent().style.height
);
canvas.viewbox(0, 0, plane.width, plane.height);

// Sub-pixel offset fix
SVG.on(window, 'resize', function () { canvas.spof(); });

canvas.on('mousedown', function (event) {
  // store start values
  this.remember('start', {
    x: event.pageX,
    y: event.pageY,
    viewbox: this.viewbox()
  });
});

canvas.on('mousemove', function (event) {
  if (this.remember('start')) {
    // add delta values
    var box = this.remember('start').viewbox;
    var x = box.x - (event.pageX - this.remember('start').x);
    var y = box.y - (event.pageY - this.remember('start').y);

    this.viewbox(x, y, box.width, box.height);
  }
});

canvas.on('mouseup', function (event) {
  this.forget('start');
});



/*SVG.extend(SVG.Element, {
  x: function(x) {
    return this.attr('x', x);
  },
  y: function(y) {
    return this.attr('y', -y);
  },
  rotate: function(r, cx, cy) {
    return this.transform({ rotation: -r, cx: cx, cy: -cy }, true);
  },
  skew: function(x, y, cx, cy) {
    return this.transform({ skewX: x, skewY: y, cx: cx, cy: -cy }, true);
  },
  translate: function (x, y) {
    return this.transform({ x: x, y: -y }, true);
  }
});

SVG.extend(SVG.G, {
  x: function(x) {
    return x == null
      ? this.transform('x')
      : this.transform({ x: -this.x() + x }, true);
  },
  y: function(y) {
    return y == null
      ? this.transform('y')
      : this.transform({ y: -this.y() + y }, true);
  },
  cx: function(x) {
    return x == null
      ? this.tbox().cx
      : this.x(x - this.tbox().width / 2);
  },
  cy: function(y) {
    return y == null
      ? this.tbox().cy
      : this.y(y - this.tbox().height / 2);
  }
})*/

SVG.Grid = SVG.invent({
  create: 'g',
  inherit: SVG.G,
  construct: {
    grid: function (size, origin) {
      var element = this.put(new SVG.Grid());

      for (let x = 0; x <= size.width - origin.x; x += size.gridX) {
        if (x !== 0) {
          element
            .line()
            .plot([
              [x, 0],
              [x, size.height]
            ])
            .y(-origin.y)
            .stroke('#000')
            .opacity(0.1);
        }
      }

      for (let x = 0; x >= -origin.x; x -= size.gridX) {
        if (x !== 0) {
          element
            .line()
            .plot([
              [x, 0],
              [x, size.height]
            ])
            .y(-origin.y)
            .stroke('#000')
            .opacity(0.1);
        }
      }

      for (let y = 0; y <= size.height - origin.y; y += size.gridY) {
        if (y !== 0) {
          element
            .line()
            .plot([
              [0, y],
              [size.width, y]
            ])
            .x(-origin.x)
            .stroke('#000')
            .opacity(0.1);
        }
      }

      for (let y = 0; y >= -origin.y; y -= size.gridY) {
        if (y !== 0) {
          element
            .line()
            .plot([
              [0, y],
              [size.width, y]
            ])
            .x(-origin.x)
            .stroke('#000')
            .opacity(0.1);
        }
      }

      return element;
    }
  }
});

SVG.Axes = SVG.invent({
  create: 'g',
  inherit: SVG.G,
  construct: {
    axes: function (size, origin) {
      var element = this.put(new SVG.Axes());

      // X axis
      element
        .line()
        .plot([
          [0, 0],
          [size.width, 0]
        ])
        .x(-origin.x)
        .stroke('#f00');

      // Y axis
      element
        .line()
        .plot([
          [0, 0],
          [0, size.height]
        ])
        .y(-origin.y)
        .stroke('#0f0');

      // Z axis
      //element.circle(16).center(0, 0).fill('#fff').stroke('#00f');
      element
        .circle(5)
        .center(0, 0)
        .fill('#00f')
        .stroke('#fff');

      return element;
    }
  }
});

SVG.Guides = SVG.invent({
  create: 'g',
  inherit: SVG.G,
  construct: {
    guides: function (size, origin) {
      var element = this.put(new SVG.Guides());

      var hGuide = function (x, y, r, point) {
        element
          .line()
          .plot([
            [-origin.x, y],
            [size.width - origin.x, y]
          ])
          .transform({
            skewY: r,
            cx: x,
            cy: y
          })
          .stroke({
            color: '#000',
            opacity: 0.8,
            dasharray: 8
          });

        if (point) {
          element
            .circle(8)
            .center(x, y)
            .fill({
              color: '#000',
              opacity: 0
            })
            .stroke({
              color: '#000',
              opacity: 0.8
            });
        }
      };
      var vGuide = function (x, y, r, point) {
        element
          .line()
          .plot([
            [x, -origin.y],
            [x, size.height - origin.y]
          ])
          .transform({
            skewX: r,
            cx: x,
            cy: y
          })
          .stroke({
            color: '#000',
            opacity: 0.8,
            dasharray: 8
          });

        if (point) {
          element
            .circle(8)
            .center(x, y)
            .fill({
              color: '#000',
              opacity: 0
            })
            .stroke({
              color: '#000',
              opacity: 0.8
            });
        }
      };

      // Main line guide
      hGuide(
        rakeTAN * (radius(REAR_WHEEL) - SEAT_HEIGHT) +
          WHEELBASE/2,
        SEAT_HEIGHT,
        STANCE,
        true
      );

      // Bone line guide
      hGuide(
        rakeSIN * (FORK.length + FORK.tripleTree/2) -
          WHEELBASE/2,
        rakeCOS * (FORK.length + FORK.tripleTree/2) +
          radius(FRONT_WHEEL),
        STANCE,
        false
      );

      // Rake guide
      vGuide(
        -WHEELBASE/2,
        radius(FRONT_WHEEL),
        RAKE,
        true
      );

      // Frame top guide
      hGuide(
        rakeSIN * (FORK.length + FORK.tripleTree/2) -
          WHEELBASE/2,
        rakeCOS * (FORK.length + FORK.tripleTree/2) +
          radius(FRONT_WHEEL),
        -RAKE,
        true
      );

      // Frame bottom guide
      hGuide(
        rakeSIN * (FORK.length - FORK.tripleTree/2) -
          WHEELBASE/2,
        rakeCOS * (FORK.length - FORK.tripleTree/2) +
          radius(FRONT_WHEEL),
        -RAKE,
        true
      );

      // Body front guide
      vGuide(
        rakeSIN * (FORK.length - FORK.tripleTree/2) -
          WHEELBASE/2,
        rakeCOS * (FORK.length - FORK.tripleTree/2) +
          radius(FRONT_WHEEL),
        -RAKE,
        false
      );

      // Body front steep guide
      /*vGuide(
        rakeSIN * (FORK.length + FORK.tripleTree/2) -
          WHEELBASE/2,
        rakeCOS * (FORK.length + FORK.tripleTree/2) +
          radius(FRONT_WHEEL),
        -STANCE,
        false
      );*/

      // Body rear guide
      vGuide(
        0,
        SEAT_HEIGHT,
        -RAKE,
        false
      );

      // Body bottom guide
      hGuide(
        0,
        CLEARANCE,
        0,
        false
      );

      // Seat guide
      hGuide(
        0,
        SEAT_HEIGHT,
        0,
        false
      );

      // Seat rear guide
      vGuide(
        WHEELBASE/2,
        radius(REAR_WHEEL),
        -RAKE,
        true
      );

      // Swingarm guide
      /*hGuide(
        WHEELBASE/2,
        radius(REAR_WHEEL),
        -STANCE,
        false
      );*/

      return element;
    }
  }
});

// A rim and tire
SVG.Wheel = SVG.invent({
  create: 'g',
  inherit: SVG.G,
  construct: {
    wheel: function (wheel, textSize) {
      var element = this.put(new SVG.Wheel());

      var tire = element
        .circle(wheel.tire.OD)
        .center(0, 0)
        .fill('#333')
        .stroke({
          color: '#000',
          width: 10
        });

      var rim = element
        .circle((wheel.tire.OD + wheel.rim.OD) / 2)
        .center(0, 0)
        .fill('#000')
        .stroke({
          color: '#fff',
          width: (wheel.tire.OD - wheel.rim.OD) / 2
        });

      tire.maskWith(rim);

        if (textSize > 0) {
        element
          .text(String(wheel.tire.OD) + 'mm')
          .transform({
            cy: textSize/3,
            scaleY: -1
          })
          .font({
            size: textSize,
            anchor: 'middle',
            leading: 1
          });
    }

      return element;
    }
  }
});

SVG.Battery = SVG.invent({
  create: 'g',
  inherit: SVG.G,
  construct: {
    battery: function () {
      var element = this.put(new SVG.Battery());

      element
        .rect(
          BATTERY.diameterTot * BATTERY.y3D,
          BATTERY.lengthTot * BATTERY.z3D
        )
        .center(0, 0)
        .fill({
          color: '#0f0',
          opacity: 0.2
        })
        .stroke('#0f0');

      return element;
    }
  }
});



var page = canvas.group();

// Create a white background
page
  .rect(
    plane.width,
    plane.height
  )
  .translate(
    -origin.x,
    -origin.y
  )
  .fill('#fff');
/*.stroke('#f1c').filter(function (add) {
  var blur = add.offset(20, 20).in(
    add.sourceAlpha).gaussianBlur(5);

  add.blend(add.source, blur);

  this.size('200%','200%').translate('-50%', '-50%');
});*/

page.flip('y');
page.transform({x: origin.x, y: plane.height - origin.y});

//page.grid(plane, origin);
//page.axes(plane, origin);
page.guides(plane, origin);

page
  .wheel(FRONT_WHEEL, 0)
  .translate(
    -WHEELBASE/2,
    radius(FRONT_WHEEL)
  );
page
  .wheel(REAR_WHEEL, 0)
  .translate(
    WHEELBASE/2,
    radius(REAR_WHEEL)
  );

page
  .battery()
  .translate(
    -BATTERY.lengthTot * BATTERY.z3D * 3 * rakeSIN - BATTERY.diameter,
    BATTERY.lengthTot * BATTERY.z3D * 3 * rakeCOS + CLEARANCE
  )
  .rotate(STANCE);
page
  .battery()
  .translate(
    -BATTERY.lengthTot * BATTERY.z3D * 1.9 * rakeSIN - BATTERY.diameter,
    BATTERY.lengthTot * BATTERY.z3D * 1.9 * rakeCOS + CLEARANCE
  )
  .rotate(STANCE);
page
  .battery()
  .translate(
    -BATTERY.lengthTot * BATTERY.z3D * 0.8 * rakeSIN - BATTERY.diameter,
    BATTERY.lengthTot * BATTERY.z3D * 0.8 * rakeCOS + CLEARANCE
  )
  .rotate(STANCE);

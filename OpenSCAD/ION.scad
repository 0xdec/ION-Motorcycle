$fn = 64;
LINE = 10000;

WHEELBASE = 1400;
SEAT_HEIGHT = 800;
BAR_WIDTH = 600;
RAKE = 24;
//TRAIL = 100;

CLEARANCE = 200;
STANCE = RAKE / 3;
FRONT_TRAVEL = 120;
REAR_TRAVEL = 120;

FORK_LENGTH = 700;
FORK_DIAM = 41;
FORK_SPACING = 200;

TRIPLE_TREE_SPACING = 150;
MIRROR = 75;

F_RIM = [17, 3];
F_TIRE = [110, 70, F_RIM[0]];
R_RIM = [17, 3.5];
R_TIRE = [130, 80, R_RIM[0]];

BATTERY_CELLS_X = 8;
BATTERY_CELLS_Y = 16;
BATTERY_CELLS_Z = 2;

function mm(in) = in * 25.4;
function diameter(tire) = (mm(tire[2]) + (2 * tire[0] * tire[1] / 100));
function radius(tire) = diameter(tire) / 2;

// Center the camera
//$vpr = [75, 0, 30];
$vpt = [0, 0, SEAT_HEIGHT / 2];
$vpd = WHEELBASE * 3;

// Print some data
echo(str("Front Tire: ", diameter(F_TIRE), " / ", radius(F_TIRE), "mm"));
echo(str("Rear Tire: ", diameter(R_TIRE), " / ", radius(R_TIRE), "mm"));



// A single rim
module rim(diameter, width) {
  color([1, 1, 1, 0.1])
  cylinder(width, d = diameter, center = true);
}

// A single tire
module tire(width, ratio, diameter) {
  outer = diameter + (2 * width * ratio / 100);
  color([0.1, 0.1, 0.1])
  difference() {
    cylinder(width, d = outer, center = true);
    cylinder(width + 1, d = diameter, center = true);
  }
}

// A rim and a tire, rotated to the correct orientation
module wheel(rim, tire) {
  rotate([90, 0, 0]) {
    rim(mm(rim[0]), mm(rim[1]));
    tire(tire[0], tire[1], mm(tire[2]));
  }
}

// Front wheel fork
module fork(length, diameter, travel) {
  cylinder(length, d = diameter, center = true);
}

// Bar-end mirror
module mirror(diameter) {
  cylinder(5, d = diameter, center = true);
}



// Main line guide
#translate([-(WHEELBASE / 2 - tan(RAKE) * (SEAT_HEIGHT - radius(R_TIRE))), 0, SEAT_HEIGHT])
rotate([0, STANCE + 90, 0])
cylinder(LINE, 1, center = true);

// Seat guide
#translate([0, 0, SEAT_HEIGHT])
rotate([0, 90, 0])
cylinder(LINE, 1, center = true);

#translate([WHEELBASE / 2, 0, radius(F_TIRE)])
rotate([0, -RAKE, 0])
translate([0, 0, FORK_LENGTH]) {
  // Rake guide
  cylinder(LINE, 1, center = true);

  // Body front guide
  rotate([0, RAKE + STANCE, 0])
  cylinder(LINE, 1, center = true);

  // Main frame guides
  rotate([0, 90, 0]) {
    // Top
    cylinder(LINE, 1, center = true);

    // Bone line guide
    translate([TRIPLE_TREE_SPACING / 2, 0, 0])
    rotate([0, RAKE + STANCE, 0])
    cylinder(LINE, 1, center = true);

    translate([TRIPLE_TREE_SPACING, 0, 0]) {
      // Bottom
      cylinder(LINE, 1, center = true);

      // Body front guide
      rotate([0, 2 * RAKE - 90, 0])
      cylinder(LINE, 1, center = true);
    }
  }
}

// Body bottom guide
#translate([0, 0, CLEARANCE])
rotate([0, 90, 0])
cylinder(LINE, 1, center = true);

#translate([-WHEELBASE / 2, 0, radius(R_TIRE)]) {
  // Seat rear guide
  rotate([0, RAKE, 0])
  cylinder(LINE, 1, center = true);

  // Swingarm guide
  /*rotate([0, 90 - STANCE, 0])
  cylinder(LINE, 1, center = true);*/
}



// Wheels
translate([WHEELBASE / 2, 0, radius(F_TIRE)])
wheel(F_RIM, F_TIRE);

translate([-WHEELBASE / 2, 0, radius(R_TIRE)])
wheel(R_RIM, R_TIRE);

// Forks
translate([WHEELBASE / 2, FORK_SPACING / 2, radius(F_TIRE)])
rotate([0, -RAKE, 0])
translate([0, 0, FORK_LENGTH / 2])
fork(FORK_LENGTH, FORK_DIAM, FRONT_TRAVEL);

translate([WHEELBASE / 2, -FORK_SPACING / 2, radius(F_TIRE)])
rotate([0, -RAKE, 0])
translate([0, 0, FORK_LENGTH / 2])
fork(FORK_LENGTH, FORK_DIAM, FRONT_TRAVEL);

// Mirrors
/*translate([WHEELBASE / 2 - radius(F_TIRE), BAR_WIDTH / 2,
          SEAT_HEIGHT])
rotate([0, 90, 0])
mirror(MIRROR);

translate([WHEELBASE / 2 - radius(F_TIRE), -BAR_WIDTH / 2,
          SEAT_HEIGHT])
rotate([0, 90, 0])
mirror(MIRROR);*/

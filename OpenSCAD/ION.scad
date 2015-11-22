$fn = 64;
LINE = 10000;

WHEELBASE = 1400;
FTB_HEIGHT = 910; // Height of intersection of frame, triple tree, and bone line
SEAT_HEIGHT = 800;
MAIN_LINE_HEIGHT = 770;
BAR_WIDTH = 600;
RAKE = 21;
//TRAIL = 100;
STANCE = RAKE / 3;
CLEARANCE = 200;
FORK_DIAM = 41;
FRONT_TRAVEL = 120;
REAR_TRAVEL = 120;
TRIPLE_TREE_SPACING = 150;

F_RIM = [17, 3];
F_TIRE = [110, 70, F_RIM[0]];
R_RIM = [17, 3.5];
R_TIRE = [130, 80, R_RIM[0]];
MIRROR = 75;

function mm(in) = in * 25.4;
function diameter(tire) = (mm(tire[2]) + (2 * tire[0] * tire[1] / 100));
function radius(tire) = diameter(tire) / 2;

// Center the camera
//$vpr = [75, 0, 30];
$vpt = [0, 0, MAIN_LINE_HEIGHT / 2];
$vpd = WHEELBASE * 3;



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



#translate([0, 0, MAIN_LINE_HEIGHT]) {
  // Main line guide
  rotate([0, STANCE - 90, 0])
  cylinder(LINE, 1, center = true);

  // Body back guide
  rotate([0, RAKE, 0])
  cylinder(LINE, 1, center = true);
}

#translate([WHEELBASE / 2 - tan(RAKE) * (FTB_HEIGHT - radius(F_TIRE)), 0, FTB_HEIGHT]) {
  // Rake guide
  rotate([0, -RAKE, 0])
  cylinder(LINE, 1, center = true);

  // Bone line guide
  rotate([0, STANCE - 90, 0])
  cylinder(LINE, 1, center = true);

  // Main frame guides
  rotate([0, -(RAKE + 90), 0]) {
    cylinder(LINE, 1, center = true);

    translate([-TRIPLE_TREE_SPACING, 0, 0])
    cylinder(LINE, 1, center = true);
  }

  // Body front guide
  rotate([0, RAKE, 0])
  cylinder(LINE, 1, center = true);
}

// Body bottom guide
#translate([0, 0, CLEARANCE])
rotate([0, 90, 0])
cylinder(LINE, 1, center = true);



// Wheels
translate([WHEELBASE / 2, 0, radius(F_TIRE)])
wheel(F_RIM, F_TIRE);

translate([-WHEELBASE / 2, 0, radius(R_TIRE)])
wheel(R_RIM, R_TIRE);

// Forks
translate([WHEELBASE / 2, mm(F_RIM[1]), radius(F_TIRE)])
rotate([0, -RAKE, 0])
translate([0, 0, radius(F_TIRE)])
fork(diameter(F_TIRE), FORK_DIAM, FRONT_TRAVEL);

translate([WHEELBASE / 2, -mm(F_RIM[1]), radius(F_TIRE)])
rotate([0, -RAKE, 0])
translate([0, 0, radius(F_TIRE)])
fork(diameter(F_TIRE), FORK_DIAM, FRONT_TRAVEL);

// Mirrors
translate([WHEELBASE / 2 - radius(F_TIRE), BAR_WIDTH / 2,
          SEAT_HEIGHT])
rotate([0, 90, 0])
mirror(MIRROR);

translate([WHEELBASE / 2 - radius(F_TIRE), -BAR_WIDTH / 2,
          SEAT_HEIGHT])
rotate([0, 90, 0])
mirror(MIRROR);

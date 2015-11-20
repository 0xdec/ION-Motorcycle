$fn = 64;

WHEELBASE = 1400;
SEAT_HEIGHT = 800;
BAR_WIDTH = 600;
RAKE = 24;
//TRAIL = 100;
STANCE = 8;
FORK_DIAM = 41;
FRONT_TRAVEL = 120;
REAR_TRAVEL = 120;

F_RIM = [17, 3];
F_TIRE = [110, 70, F_RIM[0]];
R_RIM = [17, 3.5];
R_TIRE = [130, 80, R_RIM[0]];
MIRROR = 75;

function mm(in) = in * 25.4;
function diameter(tire) = (mm(tire[2]) + (2 * tire[0] * tire[1] / 100));
function radius(tire) = diameter(tire) / 2;

module rim(diameter, width) {
  color([1, 1, 1, 0.1])
  cylinder(width, d = diameter, center = true);
}

module tire(width, ratio, diameter) {
  outer = diameter + (2 * width * ratio / 100);
  color([0.1, 0.1, 0.1])
  difference() {
    cylinder(width, d = outer, center = true);
    cylinder(width + 1, d = diameter, center = true);
  }
}

module wheel(rim, tire) {
  rotate([90, 0, 0]) {
    rim(mm(rim[0]), mm(rim[1]));
    tire(tire[0], tire[1], mm(tire[2]));
  }
}

module mirror(diameter) {
  cylinder(5, d = diameter, center = true);
}



translate([WHEELBASE / 2, 0, radius(F_TIRE)])
wheel(F_RIM, F_TIRE);

translate([-WHEELBASE / 2, 0, radius(R_TIRE)])
wheel(R_RIM, R_TIRE);

translate([WHEELBASE / 2 - radius(F_TIRE), BAR_WIDTH / 2,
          SEAT_HEIGHT])
rotate([0, 90, 0])
mirror(MIRROR);

translate([WHEELBASE / 2 - radius(F_TIRE), -BAR_WIDTH / 2,
          SEAT_HEIGHT])
rotate([0, 90, 0])
mirror(MIRROR);

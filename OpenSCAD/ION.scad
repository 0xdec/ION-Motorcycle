$fn = 64;

WHEELBASE = 1400;
F_RIM = [19, 3.25];
F_TIRE = [100, 90, 19];
R_RIM = [18, 4];
R_TIRE = [120, 90, 18];

function mm(in) = in * 25.4;
function radius(tire) = (mm(tire[2]) + (2 * tire[0] * tire[1] / 100)) / 2;

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

translate([WHEELBASE / 2, 0, radius(F_TIRE)])
wheel(F_RIM, F_TIRE);

translate([-WHEELBASE / 2, 0, radius(R_TIRE)])
wheel(R_RIM, R_TIRE);

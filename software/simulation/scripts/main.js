(function() {
  class BattCell {
    constructor(id) {
      this.id = id;
      this.update();

      // console.log(`Cell ${this.id}: ${this.voltage}mV`);
    }

    update() {
      this.voltage = Math.round((Math.random() * 0.65 + 3) * 1000);
    }
  }

  var battery = [];
  while (battery.length < 24) {
    battery.push(new BattCell(battery.length));
  }

  this.updatePack = function(el) {
    var packVoltage = 0;
    for (let cell of battery) {
      cell.update();
      packVoltage += cell.voltage;
    }

    packVoltage = `Pack: ${packVoltage / 1000}V\n${battery.length} cells`;
    document.getElementById('packvoltage').textContent = packVoltage;
  };
  this.updatePack();
})();

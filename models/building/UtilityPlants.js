class UtilityPlants extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...dict, ...subtypeData };
    super(instance);
    this.production = instance.production;
  }

    function generation(production) {
      production = turnSys
    }
}

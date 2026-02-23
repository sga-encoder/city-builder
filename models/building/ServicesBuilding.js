class ServicesBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...dict, ...subtypeData };
    super(instance);
    this.benefit = instance.benefit;
    this.radius = instance.radius;
  }
}

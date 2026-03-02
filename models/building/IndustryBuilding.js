class IndustryBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...dict, ...subtypeData };
    super(instance);
    this.capacity = instance.capacity;
    this.benefit = instance.benefit;
    this.citizens = [];
  }


}

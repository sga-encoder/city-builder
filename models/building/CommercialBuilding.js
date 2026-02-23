class CommercialBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...dict, ...subtypeData };
    super(instance);
    this.capacity = instance.capacity;
    this.income = instance.income;
    this.citizens = [];
  }
}

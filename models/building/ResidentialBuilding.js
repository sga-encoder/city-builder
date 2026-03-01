/**
 * Representa un edificio residencial en la ciudad.
 * Define costos, capacidad y consumo de recursos según el subtipo.
 *
 * @class ResidentialBuilding
 * @extends Building
 *
 * @param {Object} dict - Datos del edificio residencial
 * @param {string} dict.id - Identificador único del edificio
 * @param {string} dict.type - Tipo de edificio ('R')
 * @param {number} dict.subtype - Subtipo de vivienda (1 o 2) *
 *
 * @example
 * const house = new ResidentialBuilding({
 *   id: '00',
 *   type: 'R',
 *   subtype: 1
 * });
 */
class ResidentialBuilding extends Building {
  constructor(dict) {
    const { type, subtype } = dict;
    const subtypeData = Building.getSubtypeData(type, subtype);
    const instance = { ...subtypeData, ...dict };
    super(instance);
    this.capacity = instance.capacity;
    this.citizens = [];
  }
}

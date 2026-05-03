import Sport from './Sport.js';
import Equipment from './Equipment.js';
import SportEquipment from './SportEquipment.js';
import RequestedEquipment from './RequestedEquipment.js';

Sport.hasMany(SportEquipment, {
  foreignKey: 'sport_id',
  as: 'sportEquipments',
});

SportEquipment.belongsTo(Sport, {
  foreignKey: 'sport_id',
  as: 'sport',
});

Equipment.hasMany(SportEquipment, {
  foreignKey: 'equipment_id',
  as: 'sportEquipments',
});

SportEquipment.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment',
});

RequestedEquipment.belongsTo(SportEquipment, {
  foreignKey: 'equipment_id',
  as: 'sportEquipment',
});

SportEquipment.hasMany(RequestedEquipment, {
  foreignKey: 'equipment_id',
});

export { Sport, Equipment, SportEquipment, RequestedEquipment };
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Equipment from './Equipment.js';
import Sport from './Sport.js';

class SportEquipment extends Model {}

SportEquipment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sport_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sport,
        key: 'id',
      },
    },
    equipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Equipment,
        key: 'id',
      },
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    remaining_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'SportEquipment',
    tableName: 'sport_equipment',
    timestamps: false,
  }
);

export default SportEquipment;

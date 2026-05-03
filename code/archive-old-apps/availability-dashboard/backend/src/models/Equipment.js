import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Equipment extends Model {}

Equipment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Equipment',
    tableName: 'equipment',
    timestamps: false,
  }
);

export default Equipment;
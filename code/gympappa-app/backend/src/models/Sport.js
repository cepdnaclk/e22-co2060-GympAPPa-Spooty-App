import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Sport extends Model {}

Sport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Sport',
    tableName: 'sports',
    timestamps: false,
  }
);

export default Sport;

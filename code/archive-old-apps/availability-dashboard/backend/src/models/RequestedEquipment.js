import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class RequestedEquipment extends Model {}

RequestedEquipment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    equipment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sport_equipment',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    pickup_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('issued', 'pending_return', 'returned'),
      allowNull: false,
      defaultValue: 'issued',
    },
    requested_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RequestedEquipment',
    tableName: 'requested_equipment',
    timestamps: false,
  }
);

export default RequestedEquipment;

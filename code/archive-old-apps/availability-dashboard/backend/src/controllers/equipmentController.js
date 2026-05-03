import Sport from '../models/Sport.js';
import Equipment from '../models/Equipment.js';
import SportEquipment from '../models/SportEquipment.js';
import RequestedEquipment from '../models/RequestedEquipment.js';
import { Op } from 'sequelize';

/**
 * GET /api/equipment
 * Returns equipment grouped by sport with display names and quantities
 *
 * Response format:
 * {
 *   "Cricket": [
 *     { id: 18, display_name: "Cricket Bat", remaining_quantity: 5, total_quantity: 6 }
 *   ]
 * }
 */
export const getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await SportEquipment.findAll({
      include: [
        {
          model: Sport,
          as: 'sport',
          attributes: ['id', 'name'],
          required: true,
        },
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name'],
          required: true,
        },
      ],
      order: [
        [{ model: Sport, as: 'sport' }, 'name', 'ASC'],
        ['display_name', 'ASC'],
      ],
    });

    const groupedBySport = {};
    equipmentList.forEach((item) => {
      const sportName = item.sport.name;
      if (!groupedBySport[sportName]) {
        groupedBySport[sportName] = [];
      }
      groupedBySport[sportName].push({
        id: item.id,
        display_name: item.display_name,
        remaining_quantity: item.remaining_quantity,
        total_quantity: item.total_quantity,
      });
    });

    res.status(200).json(groupedBySport);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
};

/**
 * POST /api/equipment/request
 * Accepts: studentId, equipment_id (sport_equipment.id), quantity, pickupTime
 */
export const requestEquipment = async (req, res) => {
  const { studentId, equipment_id, quantity, pickupTime } = req.body;

  if (!studentId || !equipment_id || !quantity || !pickupTime) {
    return res.status(400).json({
      message: 'studentId, equipment_id, quantity and pickupTime are required',
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'quantity must be a positive integer' });
  }

  if (isNaN(Date.parse(pickupTime))) {
    return res.status(400).json({ message: 'Invalid pickup time format' });
  }

  const hour = new Date(pickupTime).getHours();
  if (hour < 8 || hour >= 20) {
    return res.status(400).json({ message: 'Pickup time must be between 8:00 AM and 8:00 PM' });
  }

  try {
    const activeIssued = await RequestedEquipment.count({
      where: {
        student_id: studentId,
        status: { [Op.in]: ['issued', 'pending_return'] },
      },
    });

    if (activeIssued > 0) {
      return res.status(400).json({
        message: 'You have active equipment that must be returned before requesting new items',
      });
    }

    const sportEquipment = await SportEquipment.findByPk(equipment_id);
    if (!sportEquipment) {
      return res.status(404).json({ message: 'Sport equipment not found' });
    }

    if (sportEquipment.remaining_quantity < quantity) {
      return res.status(400).json({
        message: `Insufficient equipment available. Only ${sportEquipment.remaining_quantity} remaining`,
      });
    }

    sportEquipment.remaining_quantity -= quantity;
    await sportEquipment.save();

    const request = await RequestedEquipment.create({
      student_id: studentId,
      equipment_id,
      quantity,
      pickup_time: pickupTime,
      status: 'issued',
    });

    res.status(201).json({
      message: 'Equipment request submitted successfully',
      requestId: request.id,
      status: request.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error requesting equipment' });
  }
};

export const initiateReturn = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await RequestedEquipment.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'issued') {
      return res.status(400).json({ message: 'Only issued equipment can be marked for return' });
    }

    request.status = 'pending_return';
    await request.save();

    res.status(200).json({ message: 'Equipment marked for return' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error initiating return' });
  }
};

export const approveReturn = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await RequestedEquipment.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending_return') {
      return res.status(400).json({ message: 'Only pending return requests can be approved' });
    }

    const sportEquipment = await SportEquipment.findByPk(request.equipment_id);
    if (!sportEquipment) {
      return res.status(404).json({ message: 'Sport equipment not found' });
    }

    sportEquipment.remaining_quantity += request.quantity;
    await sportEquipment.save();

    request.status = 'returned';
    await request.save();

    res.status(200).json({ message: 'Return approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving return' });
  }
};

export const cancelRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await RequestedEquipment.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'returned') {
      return res.status(400).json({ message: 'Cannot cancel a returned request' });
    }

    const sportEquipment = await SportEquipment.findByPk(request.equipment_id);
    if (sportEquipment) {
      sportEquipment.remaining_quantity += request.quantity;
      await sportEquipment.save();
    }

    await request.destroy();

    res.status(200).json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling request' });
  }
};

export const getStudentHistory = async (req, res) => {
  const studentId = decodeURIComponent(req.params.studentId);

  try {
    const requests = await RequestedEquipment.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: SportEquipment,
          as: 'sportEquipment',
          attributes: ['display_name'],
          include: [
            {
              model: Sport,
              as: 'sport',
              attributes: ['name'],
            },
            {
              model: Equipment,
              as: 'equipment',
              attributes: ['name'],
            },
          ],
        },
      ],
      order: [['requested_at', 'DESC']],
    });

    const formattedHistory = requests.map((record) => ({
      id: record.id,
      quantity: record.quantity,
      pickup_time: record.pickup_time,
      status: record.status,
      requested_at: record.requested_at,
      sport_name: record.sportEquipment?.sport?.name ?? null,
      display_name: record.sportEquipment?.display_name ?? null,
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching history' });
  }
};

export const updateEquipmentQuantity = async (req, res) => {
  const { equipmentId } = req.params;
  const { quantityChange } = req.body;

  if (typeof quantityChange !== 'number') {
    return res.status(400).json({ message: 'quantityChange must be a number' });
  }

  try {
    const sportEquipment = await SportEquipment.findByPk(equipmentId);
    if (!sportEquipment) {
      return res.status(404).json({ message: 'Sport equipment not found' });
    }

    sportEquipment.total_quantity += quantityChange;
    sportEquipment.remaining_quantity += quantityChange;
    await sportEquipment.save();

    res.status(200).json({
      message: 'Equipment quantity updated successfully',
      total_quantity: sportEquipment.total_quantity,
      remaining_quantity: sportEquipment.remaining_quantity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating equipment quantity' });
  }
};

export const issueEquipment = async (req, res) => {
  return res.status(410).json({ message: 'Use POST /api/equipment/request instead' });
};

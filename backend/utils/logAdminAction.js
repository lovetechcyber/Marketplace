const AuditLog = require('../models/AuditLog');

exports.logAdminAction = async ({ adminId, action, targetId, targetType, details }) => {
  await AuditLog.create({ adminId, action, targetId, targetType, details });
};
router.get('/audit-logs', verifyToken, verifyAdmin, async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).populate('adminId', 'email');
  res.json(logs);
});

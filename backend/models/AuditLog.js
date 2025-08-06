const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  targetId: String,
  targetType: String,
  details: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const {
  listDisputes,
  resolveDispute,
  markAsReleased,
  getKYCRequests,
  approveKYC,
  rejectKYC,
  getLiveUsers,
  getLiveProducts,
  toggleLiveStatus,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserWalletBalance,
  banUser
} = require('../controllers/adminController');

router.get('/disputes', verifyAdmin, listDisputes);
router.patch('/dispute/:id/resolve', verifyAdmin, resolveDispute);
router.patch('/transaction/:id/release', verifyAdmin, markAsReleased);
router.get('/kyc-requests', verifyAdmin, getKYCRequests);
router.patch('/kyc/:id/approve', verifyAdmin, approveKYC);
router.patch('/kyc/:id/reject', verifyAdmin, rejectKYC);
router.get('/live-users', verifyAdmin, getLiveUsers);
router.get('/live-products', verifyAdmin, getLiveProducts);
router.patch('/user/:id/toggle-live-status', verifyAdmin, toggleLiveStatus);
router.get('/users', verifyAdmin, getAllUsers);
router.get('/user/:id', verifyAdmin, getUserById);
router.put('/user/:id', verifyAdmin, updateUser);
router.delete('/user/:id', verifyAdmin, deleteUser);
router.get('/user/:id/wallet-balance', verifyAdmin, getUserWalletBalance);
GET /api/admin/withdrawals
PATCH /api/admin/withdrawal/:id/mark-paid
PATCH /api/admin/withdrawal/:id/mark-failed
PATCH /api/admin/user/:id/ban
PATCH /api/admin/user/:id/unban




module.exports = router;

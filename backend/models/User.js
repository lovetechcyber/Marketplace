const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    resetToken: String,
    resetTokenExpiry: Date,
    isVerified: { type: Boolean, default: false },
    kyc: {
      idType: String,
      idUrl: String,
      faceImageUrl: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    kycDocumentUrl: String,
    kycSelfieUrl: String,
    walletBalance: { type: Number, default: 0 },
    bankDetails: {
      bankCode: String,
      accountNumber: String,
      bankName: String,
    },
    isLive: { type: Boolean, default: false },
    liveProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    agoraChannelName: { type: String, default: "" },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

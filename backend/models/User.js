{
  fullName: String,
  email: String,
  phone: String,
  passwordHash: String,
  profilePhoto: String,
  isVerified: Boolean,
  kyc: {
    idType: String,
    idUrl: String,
    faceImageUrl: String,
    status: "pending" | "approved" | "rejected"
  },
  walletBalance: Number,
  bankDetails: {
    bankCode: String,
    accountNumber: String,
    bankName: String
  }
}

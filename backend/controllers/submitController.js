const User = require('../models/User');
const cloudinary = require('../services/cloudinaryService');
// import dojah or smileidentity SDK if using

exports.submitKYC = async (req, res) => {
  try {
    const { idType } = req.body;
    const idImage = req.files.idImage?.[0];
    const selfie = req.files.selfie?.[0];

    if (!idImage || !selfie) {
      return res.status(400).json({ error: 'ID and selfie required' });
    }

    // Upload to Cloudinary
    const idUpload = await cloudinary.uploader.upload_stream_to_cloudinary(idImage.buffer, 'kyc_ids');
    const selfieUpload = await cloudinary.uploader.upload_stream_to_cloudinary(selfie.buffer, 'kyc_selfies');

    // Optional: send to Smile Identity or Dojah API
    // Mock KYC pass (assume success for now)
    const kycPassed = true;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      kyc: {
        idType,
        idUrl: idUpload.secure_url,
        faceImageUrl: selfieUpload.secure_url,
        status: kycPassed ? 'approved' : 'pending'
      }
    }, { new: true });

    res.json({ message: 'KYC submitted', kycStatus: updatedUser.kyc.status });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit KYC' });
  }
};

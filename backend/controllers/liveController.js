const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const User = require('../models/User');

exports.goLive = async (req, res) => {
  const APP_ID = process.env.AGORA_APP_ID;
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

  const channelName = `live_${req.user.id}`;
  const uid = req.user.id;
  const role = RtcRole.PUBLISHER;
  const expireTime = 3600; // 1 hour

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    Math.floor(Date.now() / 1000) + expireTime
  );

  await User.findByIdAndUpdate(req.user.id, {
    isLive: true,
    agoraChannelName: channelName,
    liveProductId: req.body.productId
  });

  res.json({ token, channelName, uid });
};

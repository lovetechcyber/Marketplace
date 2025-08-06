const jwt = require('jsonwebtoken');

const accessToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

res.json({ accessToken });

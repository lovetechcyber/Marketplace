export async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  } catch {
    res.sendStatus(403);
  }
}

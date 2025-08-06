router.patch(
  '/:id/dispute',
  verifyToken,
  upload.single('evidence'),
  openDispute
);

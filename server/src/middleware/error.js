export function notFound(req, res) {
  res.status(404).json({ message: 'API route not found' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err?.name === 'ZodError') return res.status(400).json({ message: err.issues?.[0]?.message || 'Invalid request', issues: err.issues });
  if (err?.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  if (err?.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err?.code === 11000) return res.status(409).json({ message: 'This record already exists' });
  res.status(err.status || 500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error') });
}

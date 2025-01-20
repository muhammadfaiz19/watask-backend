const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token JWT
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Ambil token dari header Authorization

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verifikasi token dengan JWT Secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyimpan data user yang terdekode ke dalam req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware untuk memastikan hanya admin yang bisa mengakses rute
const isAdmin = (req, res, next) => {
  // Cek jika user memiliki peran 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden, admin access only' });
  }
  next();
};

module.exports = { protect, isAdmin };

import jwt from 'jsonwebtoken';

/**
 * The Security Bouncer
 * Checks for a valid "Access Badge" (Token)
 */
export const verifyToken = (req, res, next) => {
  // We look for the badge in the cookie or the Authorization header
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No access badge found. Please log in.' });
  }

  try {
    // We verify the badge using the secret key from your .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'autopart_secret_key');
    req.user = decoded; 
    next(); // Pass: You are allowed to move to the next step
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired access badge.' });
  }
};

/**
 * The Admin Guard
 * This ensures only the "Main Oga" can add or delete parts.
 */
export const verifyAdmin = (req, res, next) => {
  // We check if the badge belongs to an administrator
  if (req.user && req.user.is_admin) {
    next(); // Pass: You are an Admin
  } else {
    res.status(403).json({ message: 'Access denied. Management only.' });
  }
};
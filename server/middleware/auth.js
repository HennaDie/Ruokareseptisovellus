const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'Token puuttuu' });
    }

    
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Käyttäjää ei löydy' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token virheellinen' });
  }
};

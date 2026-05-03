const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Instead of saving raw refresh token, save hashed version
  const hashedRefreshToken = hashToken(refreshToken);
  user.refreshTokens.push(hashedRefreshToken);
  
  user.save({ validateBeforeSave: false }).then(() => {
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    };

    res.cookie('jwt_refresh', refreshToken, cookieOptions);

    // Remove password from output
    user.password = undefined;
    user.refreshTokens = undefined;

    res.status(statusCode).json({
      success: true,
      data: {
        user,
        accessToken
      }
    });
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  hashToken,
  sendTokenResponse
};

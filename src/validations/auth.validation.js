const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    role: Joi.string().valid('employee', 'admin').required(),
  }),
};

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    role: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
};

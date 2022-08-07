const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTicket = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    assignedTo: Joi.string().required(),
    status: Joi.string(),
    priority: Joi.string(),
  }),
};

const getTickets = {
  query: Joi.object().keys({
    ticketId: Joi.string(),
    title: Joi.string(),
    status: Joi.string(),
    priority: Joi.string(),
    assignedTo: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
};

const closeTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
};

const deleteTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  closeTicket,
  deleteTicket,
};

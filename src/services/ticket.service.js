const httpStatus = require('http-status');
const { Ticket } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a Ticket
 * @param {Object} ticketBody
 * @returns {Promise<Ticket>}
 */
const createTicket = async (ticketBody) => {
  return Ticket.create(ticketBody);
};

/**
 * Query for ticket
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTickets = async (filter, options) => {
  // eslint-disable-next-line no-param-reassign
  filter.isDeleted = false;
  const ticket = await Ticket.paginate(filter, options);
  return ticket;
};

/**
 * Query for ticket
 * @param {Object} filter - Mongo filter
 * @returns {Promise<count>}
 */
const countTickets = async (filter) => {
  // eslint-disable-next-line no-param-reassign
  filter.isDeleted = false;
  const count = await Ticket.count(filter);
  return count;
};

/**
 * Get ticket by id
 * @param {ObjectId} id
 * @returns {Promise<Ticket>}
 */
const getTicketById = async (id) => {
  return Ticket.findOne({
    _id: id,
    isDeleted: false,
  });
};

/**
 * Update ticket by id
 * @param {ObjectId} ticketId
 * @param {Object} updateBody
 * @returns {Promise<Ticket>}
 */
const updateTicketById = async (ticketId, updateBody) => {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }
  Object.assign(ticket, updateBody);
  await ticket.save();
  return ticket;
};

/**
 * Delete ticket by id
 * @param {ObjectId} ticketId
 * @returns {Promise<Ticket>}
 */
const deleteTicketById = async (ticketId, by) => {
  const ticket = await updateTicketById(ticketId, {
    isDeleted: true,
    deletedBy: by
  });
  return ticket;
};

/**
 * Close ticket by id
 * @param {ObjectId} ticketId
 * @returns {Promise<Ticket>}
 */
const closeTicket = async (ticketId, by) => {
  const ticket = await updateTicketById(ticketId, {
    status: 'close',
    closedBy: by,
  });
  return ticket;
};

module.exports = {
  createTicket,
  queryTickets,
  countTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
  closeTicket,
};

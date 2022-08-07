const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ticketService } = require('../services');

const createTicket = catchAsync(async (req, res) => {
  const ticketCreated = await ticketService.createTicket(req.body);
  if (!ticketCreated) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Ticket not created');
  }
  const ticket = await ticketService.queryTickets({ _id: ticketCreated.id }, { populate: 'assignedTo' });
  if (!ticket) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Ticket not created');
  }
  res.status(httpStatus.CREATED).send(ticket);
});

const getAllTickets = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'assignedTo';
  const result = await ticketService.queryTickets({}, options);
  res.send(result);
});

const getTicketsByFilter = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['ticketId', 'status', 'title', 'priority']);
  if (filter.ticketId) {
    filter._id = filter.ticketId;
    delete filter.ticketId;
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'assignedTo';
  const result = await ticketService.queryTickets(filter, options);
  res.send(result);
});

const getTicketById = catchAsync(async (req, res) => {
  const { ticketId } = req.params;
  const ticket = await ticketService.queryTickets({ _id: ticketId }, { populate: 'assignedTo' });
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }
  res.send(ticket);
});

const closeTicketById = catchAsync(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
  }
  if (req.user.role !== 'admin' && ticket.assignedTo !== req.user._id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Not Allowed');
  }
  const result = await ticketService.queryTickets({
    assignedTo: ticket.assignedTo,
    priority: 'high',
  });
  if (Array.isArray(result) && result.length) {
    return res.statusCode(400).send({
      error: 'A higher priority task remains to be closed',
      result,
    });
  }
  await ticketService.closeTicket(req.params.ticketId, req.user._id);
  res.send('Ticket closed successfully');
});

/* const updateTicketById = catchAsync(async (req, res) => {
  const ticket = await ticketService.updateTicketById(req.params.ticketId, req.body);
  res.send(ticket);
}); */

const deleteTicketById = catchAsync(async (req, res) => {
  await ticketService.deleteTicketById(req.params.ticketId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTicket,
  getAllTickets,
  getTicketsByFilter,
  getTicketById,
  closeTicketById,
  // updateTicketById,
  deleteTicketById,
};

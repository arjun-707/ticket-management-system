const mongoose = require('mongoose');
const faker = require('faker');
const Ticket = require('../../src/models/ticket.model');

const ticketOne = {
  _id: mongoose.Types.ObjectId(),
  title: faker.name.findName(),
  assignedTo: mongoose.Types.ObjectId(),
};

const ticketTwo = {
  _id: mongoose.Types.ObjectId(),
  title: faker.name.findName(),
  assignedTo: mongoose.Types.ObjectId(),
};

const admin = {
  _id: mongoose.Types.ObjectId(),
  title: faker.name.findName(),
  assignedTo: mongoose.Types.ObjectId(),
};

const insertTicket = async (tickets) => {
  await Ticket.insertMany(tickets.map((ticket) => ({ ...ticket })));
};

module.exports = {
  ticketOne,
  ticketTwo,
  admin,
  insertTicket,
};

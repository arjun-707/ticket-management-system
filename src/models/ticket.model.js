const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ticketSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'close'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    closedBy: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ticketSchema.plugin(toJSON);
ticketSchema.plugin(paginate);

/**
 * @typedef Ticket
 */
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;

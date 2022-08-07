const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ticketValidation = require('../../validations/ticket.validation');
const ticketController = require('../../controllers/ticket.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageTickets'), validate(ticketValidation.createTicket), ticketController.createTicket)
  .get(auth('getTickets'), validate(ticketValidation.getTickets), ticketController.getTicketsByFilter);

router.route('/all').get(auth('getTickets'), ticketController.getAllTickets);
router
  .route('/markAsClosed/:ticketId')
  .patch(auth('editTickets'), validate(ticketValidation.closeTicket), ticketController.closeTicketById);

router
  .route('/:ticketId')
  .get(auth('getTickets'), validate(ticketValidation.getTicket), ticketController.getTicketById)
  .delete(auth('manageTickets'), validate(ticketValidation.deleteTicket), ticketController.deleteTicketById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management and retrieval
 */

/**
 * @swagger
 * /tickets/:
 *   post:
 *     summary: Create a ticket
 *     description: Create a ticket and assign to user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - assignedTo
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                  type: string
 *                  enum: [open, close]
 *                  description: default open
 *               priority:
 *                  type: string
 *                  enum: [low, mid, high]
 *                  description: default low
 *               assignedTo:
 *                  type: string
 *                  description: user id
 *             example:
 *               title: some title
 *               status: open
 *               priority: mid
 *               assignedTo: some user Id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get tickets details by filters
 *     description: Anyone can retrieve all tickets using filters.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Ticket title
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Ticket priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Ticket alloted to
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of tickets
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /tickets/all:
 *   get:
 *     summary: Get all tickets detail
 *     description: Only admins can retrieve all tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Ticket title
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Ticket priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Ticket alloted to
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of tickets
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /tickets/{ticketId}:
 *   get:
 *     summary: Get a ticket detail
 *     description: Anyone can fetch other tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Ticket'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Soft Delete a ticket
 *     description: Only admins can delete the tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /tickets/markAsClosed/{ticketId}:
 *   patch:
 *     summary: Close a ticket
 *     description: Anyone can close other tickets.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Ticket'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

# Ticket Management System - RESTful API Node Server

## Prerequisite
* Node.Js (12.0^)
* MongoDB

## Quick Start

To run this project, simply clone:

```bash
git clone 
```

## Manual Work

Install the dependencies:

```bash
npm install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Port number
PORT=3000

# URL of the Mongo DB
MONGODB_URL=mongodb://127.0.0.1:27017/ticket-system

# JWT
# JWT secret key
JWT_SECRET=thisisaticketsystemsecret
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=30
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=30

## Project Structure

```
src\
 |--config\         # Environment variables and configuration related things\
 |--controllers\    # Route controllers (controller layer)\
 |--docs\           # Swagger files\
 |--middlewares\    # Custom express middlewares\
 |--models\         # Mongoose models (data layer)\
 |--routes\         # Routes\
 |--services\       # Business logic (service layer)\
 |--utils\          # Utility classes and functions\
 |--validations\    # Request data validation schemas\
 |--app.js          # Express app\
 |--index.js        # App entry point\
```

## API Documentation

To view the list of available APIs and their specifications, run the server and 
go to 
### `http://localhost:3000/v1/docs` 
in your browser. 
This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions 
written as comments in the route files.

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/users/new` - register\
`POST /v1/users/login` - login\
`POST /v1/users/logout` - logout\
`POST /v1/users/refresh-tokens` - refresh auth tokens\

**Ticket routes**:\
`POST /v1/tickets/create` - register\
`GET /v1/tickets/` - filteredTicketDetails\
`GET /v1/tickets/all` - allTicketDetail\
`GET /v1/tickets/{ticketId}` - ticketDetail\
`PATCH /v1/tickets/markAsClosed/{ticketId}` - close\
`DELETE /v1/tickets/{ticketId}` - delete\

### Logs 
The logs will be exported to `logs/<NODE_ENV>.log` file
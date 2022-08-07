const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');
const { ticketOne, ticketTwo, admin, insertTicket } = require('../fixtures/ticket.fixture');
const { ticketOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Ticket routes', () => {
  describe('POST /v1/tickets', () => {
    let newTicket;

    beforeEach(() => {
      newTicket = {
        title: faker.name.findName(),
        assignedTo: 'userId',
      };
    });

    test('should return 201 and successfully create new ticket if data is ok', async () => {
      await insertTicket([admin]);

      const res = await request(app)
        .post('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newTicket)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        title: newTicket.name,
        status: newTicket.email,
        priority: newTicket.role,
        isDeleted: false,
      });

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newTicket.password);
      expect(dbUser).toMatchObject({
        name: newTicket.name,
        email: newTicket.email,
        role: newTicket.role,
        isEmailVerified: false,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/tickets').send(newTicket).expect(httpStatus.UNAUTHORIZED);
    });

  describe('GET /v1/tickets', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      const res = await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]).toEqual({
        id: ticketOne._id.toHexString(),
        name: ticketOne.name,
        email: ticketOne.email,
        role: ticketOne.role,
        isEmailVerified: ticketOne.isEmailVerified,
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      await request(app).get('/v1/tickets').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all users', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on title field', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      const res = await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: ticketOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(ticketOne._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      const res = await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(ticketOne._id.toHexString());
      expect(res.body.results[1].id).toBe(ticketTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(admin._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      const res = await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(admin._id.toHexString());
      expect(res.body.results[1].id).toBe(ticketOne._id.toHexString());
      expect(res.body.results[2].id).toBe(ticketTwo._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      const res = await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'role:desc,name:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);

      const expectedOrder = [ticketOne, ticketTwo, admin].sort((a, b) => {
        if (a.role < b.role) {
          return 1;
        }
        if (a.role > b.role) {
          return -1;
        }
        return a.name < b.name ? -1 : 1;
      });

      expectedOrder.forEach((user, index) => {
        expect(res.body.results[index].id).toBe(user._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      const res = await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(ticketOne._id.toHexString());
      expect(res.body.results[1].id).toBe(ticketTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertTicket([ticketOne, ticketTwo, admin]);

      const res = await request(app)
        .get('/v1/tickets')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(admin._id.toHexString());
    });
  });

  describe('GET /v1/tickets/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await insertTicket([ticketOne]);

      const res = await request(app)
        .get(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: ticketOne._id.toHexString(),
        email: ticketOne.email,
        name: ticketOne.name,
        role: ticketOne.role,
        isEmailVerified: ticketOne.isEmailVerified,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTicket([ticketOne]);

      await request(app).get(`/v1/tickets/${ticketOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another user', async () => {
      await insertTicket([ticketOne, ticketTwo]);

      await request(app)
        .get(`/v1/tickets/${ticketTwo._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the user object if admin is trying to get another user', async () => {
      await insertTicket([ticketOne, admin]);

      await request(app)
        .get(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertTicket([admin]);

      await request(app)
        .get('/v1/tickets/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await insertTicket([admin]);

      await request(app)
        .get(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/tickets/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertTicket([ticketOne]);

      await request(app)
        .delete(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(ticketOne._id);
      expect(dbUser).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTicket([ticketOne]);

      await request(app).delete(`/v1/tickets/${ticketOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete another user', async () => {
      await insertTicket([ticketOne, ticketTwo]);

      await request(app)
        .delete(`/v1/tickets/${ticketTwo._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user', async () => {
      await insertTicket([ticketOne, admin]);

      await request(app)
        .delete(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertTicket([admin]);

      await request(app)
        .delete('/v1/tickets/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user already is not found', async () => {
      await insertTicket([admin]);

      await request(app)
        .delete(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/tickets/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertTicket([ticketOne]);
      const updateBody = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'newPassword1',
      };

      const res = await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: ticketOne._id.toHexString(),
        name: updateBody.name,
        email: updateBody.email,
        role: 'user',
        isEmailVerified: false,
      });

      const dbUser = await User.findById(ticketOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({ name: updateBody.name, email: updateBody.email, role: 'user' });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTicket([ticketOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app).patch(`/v1/tickets/${ticketOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another user', async () => {
      await insertTicket([ticketOne, ticketTwo]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/tickets/${ticketTwo._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user', async () => {
      await insertTicket([ticketOne, admin]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      await insertTicket([admin]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertTicket([admin]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/tickets/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is invalid', async () => {
      await insertTicket([ticketOne]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is already taken', async () => {
      await insertTicket([ticketOne, ticketTwo]);
      const updateBody = { email: ticketTwo.email };

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should not return 400 if email is my email', async () => {
      await insertTicket([ticketOne]);
      const updateBody = { email: ticketOne.email };

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 400 if password length is less than 8 characters', async () => {
      await insertTicket([ticketOne]);
      const updateBody = { password: 'passwo1' };

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if password does not contain both letters and numbers', async () => {
      await insertTicket([ticketOne]);
      const updateBody = { password: 'password' };

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = '11111111';

      await request(app)
        .patch(`/v1/tickets/${ticketOne._id}`)
        .set('Authorization', `Bearer ${ticketOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});

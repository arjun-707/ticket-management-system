const mongoose = require('mongoose');
const faker = require('faker');
const User = require('../../src/models/user.model');

const userOne = {
  _id: mongoose.Types.ObjectId(),
  username: faker.name.findName(),
  role: 'employee',
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  username: faker.name.findName(),
  role: 'employee',
};

const admin = {
  _id: mongoose.Types.ObjectId(),
  username: faker.name.findName(),
  role: 'admin',
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user })));
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};

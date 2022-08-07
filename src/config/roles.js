const allRoles = {
  employee: ['getTickets', 'editTickets'],
  admin: ['editTickets', 'getTickets', 'manageTickets'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

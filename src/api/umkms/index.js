const UmkmsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'umkms',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const umkmsHandler = new UmkmsHandler(service, validator);
    server.route(routes(umkmsHandler));
  },
};

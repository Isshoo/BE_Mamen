const ProductsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'products',
  version: '1.0.0',
  register: async (server, { service, storageService, validator }) => {
    const productsHandler = new ProductsHandler(service, storageService, validator);
    server.route(routes(productsHandler));
  },
};

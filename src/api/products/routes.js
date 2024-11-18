const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/umkms/{umkmId}/products',
    handler: handler.postProductHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'GET',
    path: '/umkms/{umkmId}/products',
    handler: handler.getProductsByUmkmHandler,
  },
  {
    method: 'GET',
    path: '/products',
    handler: handler.getProductsHandler,
  },
  {
    method: 'GET',
    path: '/products/{id}',
    handler: handler.getProductByIdHandler,
  },
  {
    method: 'PUT',
    path: '/umkms/{umkmId}/products/{id}',
    handler: handler.putProductByIdHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/umkms/{umkmId}/products/{id}',
    handler: handler.deleteProductByIdHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'POST',
    path: '/umkms/{umkmId}/products/{id}/covers',
    handler: handler.postProductCoverHandler,
    options: {
      auth: 'mamen_jwt',
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 5242880,
      },
    },
  },
  {
    method: 'GET',
    path: '/products/{params*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = routes;

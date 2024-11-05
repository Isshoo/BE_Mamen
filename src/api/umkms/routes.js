const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/umkms',
    handler: handler.postUmkmHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'GET',
    path: '/umkms',
    handler: handler.getUmkmsHandler,
  },
  {
    method: 'GET',
    path: '/umkms/{id}',
    handler: handler.getUmkmByIdHandler,
  },
  {
    method: 'PUT',
    path: '/umkms/{id}',
    handler: handler.putUmkmByIdHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/umkms/{id}',
    handler: handler.deleteUmkmByIdHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'POST',
    path: '/umkms/{id}/covers',
    handler: handler.postUmkmCoverHandler,
    options: {
      auth: 'mamen_jwt',
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'GET',
    path: '/umkms/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = routes;

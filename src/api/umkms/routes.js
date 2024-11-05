const routes = (handler) => [
  {
    method: 'POST',
    path: '/umkms',
    handler: handler.postUmkmHandler,
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
  },
  {
    method: 'DELETE',
    path: '/umkms/{id}',
    handler: handler.deleteUmkmByIdHandler,
  },
  {
    method: 'POST',
    path: '/umkms/{id}/covers',
    handler: handler.postUmkmCoverByIdHandler,
  },
];

module.exports = routes;

const routes = (handler) => [
  {
    method: 'POST',
    path: '/umkms/{umkmId}/reviews',
    handler: handler.postReviewHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'GET',
    path: '/umkms/{umkmId}/reviews',
    handler: handler.getReviewsByUmkmHandler,
  },
  {
    method: 'GET',
    path: '/reviews',
    handler: handler.getReviewsHandler,
  },
  {
    method: 'GET',
    path: '/reviews/{id}',
    handler: handler.getReviewByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/umkms/{umkmId}/reviews/{id}',
    handler: handler.deleteReviewByIdHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
];

module.exports = routes;

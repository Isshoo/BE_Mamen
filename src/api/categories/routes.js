const routes = (handler) => [
  {
    method: 'POST',
    path: '/umkms/{umkmId}/categories',
    handler: handler.postCategoryHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },
  {
    method: 'GET',
    path: '/umkms/{umkmId}/categories',
    handler: handler.getCategoriesByUmkmHandler,
  },
  {
    method: 'GET',
    path: '/categories',
    handler: handler.getCategoriesHandler,
  },
  {
    method: 'GET',
    path: '/categories/{id}',
    handler: handler.getCategoryByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/umkms/{umkmId}/categories/{id}',
    handler: handler.deleteCategoryByIdHandler,
    options: {
      auth: 'mamen_jwt',
    },
  },

];

module.exports = routes;

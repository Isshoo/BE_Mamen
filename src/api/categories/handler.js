const autoBind = require('auto-bind');

class CategoriesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postCategoryHandler(request, h) {
    this._validator.validateCategoryPayload(request.payload);
    const { name } = request.payload;
    const { umkmId: umkms_id } = request.params;
    const owner = request.auth.credentials.id;

    await this._service.verifyUmkmOwner(umkms_id, owner);

    const categoryId = await this._service.addCategory({ name, umkms_id });

    const response = h.response({
      status: 'success',
      message: 'Category berhasil ditambahkan',
      data: {
        categoryId,
      },
    });
    response.code(201);
    return response;
  }

  async getCategoriesByUmkmHandler(request) {
    const { umkmId } = request.params;
    const categories = await this._service.getCategoriesByUmkm(umkmId);
    return {
      status: 'success',
      data: {
        categories,
      },
    };
  }

  async getCategoriesHandler() {
    const categories = await this._service.getAllCategories();
    return {
      status: 'success',
      data: {
        categories,
      },
    };
  }

  async getCategoryByIdHandler(request) {
    const { id } = request.params;
    const category = await this._service.getCategoryById(id);
    return {
      status: 'success',
      data: {
        category,
      },
    };
  }

  async deleteCategoryByIdHandler(request) {
    const { id } = request.params;
    const { umkmId: umkms_id } = request.params;
    const owner = request.auth.credentials.id;
    await this._service.verifyUmkmOwner(umkms_id, owner);
    await this._service.deleteCategoryById(id);

    return {
      status: 'success',
      message: 'Category berhasil dihapus',
    };
  }
}

module.exports = CategoriesHandler;

const autoBind = require('auto-bind');

class ProductsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postProductHandler(request, h) {
    this._validator.validateProductPayload(request.payload);
    const {
      name, product_type, description, price, cover_url = null,
    } = request.payload;
    const { umkmId: umkms_id } = request.params;
    const owner = request.auth.credentials.id;

    await this._service.verifyUmkmOwner(umkms_id, owner);

    const productId = await this._service.addProduct({
      name, product_type, description, price, cover_url, umkms_id,
    });

    const response = h.response({
      status: 'success',
      message: 'Product berhasil ditambahkan',
      data: {
        productId,
      },
    });
    response.code(201);
    return response;
  }

  async getProductsByUmkmHandler(request) {
    const { umkmId } = request.params;
    const products = await this._service.getProductsByUmkm(umkmId);
    return {
      status: 'success',
      data: {
        products,
      },
    };
  }

  async getProductsHandler() {
    const products = await this._service.getAllProducts();
    return {
      status: 'success',
      data: {
        products,
      },
    };
  }

  async getProductByIdHandler(request) {
    const { id } = request.params;
    const product = await this._service.getProductById(id);
    return {
      status: 'success',
      data: {
        product,
      },
    };
  }

  async putProductByIdHandler(request) {
    this._validator.validateProductPayload(request.payload);
    const { id } = request.params;
    const { umkmId: umkms_id } = request.params;
    const owner = request.auth.credentials.id;
    await this._service.verifyUmkmOwner(umkms_id, owner);

    await this._service.editProductById(id, request.payload);

    return {
      status: 'success',
      message: 'Product berhasil diperbarui',
    };
  }

  async deleteProductByIdHandler(request) {
    const { id } = request.params;
    const { umkmId: umkms_id } = request.params;
    const owner = request.auth.credentials.id;
    await this._service.verifyUmkmOwner(umkms_id, owner);
    await this._service.deleteProductById(id);

    return {
      status: 'success',
      message: 'Product berhasil dihapus',
    };
  }

  async postProductCoverHandler(request, h) {
    const { id: productId } = request.params;
    const { cover_url } = request.payload;
    const { umkmId: umkms_id } = request.params;
    const owner = request.auth.credentials.id;
    await this._service.verifyUmkmOwner(umkms_id, owner);

    this._validator.validateImageHeaders(cover_url.hapi.headers);

    const fileLocation = await this._storageService.writeFile(cover_url, cover_url.hapi);
    const path = fileLocation;

    await this._service.updateProductCover(productId, { path });

    const response = h.response({
      status: 'success',
      message: 'Cover Product berhasil diubah',
    });
    response.code(201);
    return response;
  }
}

module.exports = ProductsHandler;

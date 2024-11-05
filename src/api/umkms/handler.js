const autoBind = require('auto-bind');

class UmkmsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUmkmHandler(request, h) {
    this._validator.validateUmkmPayload(request.payload);
    const { name, year } = request.payload;

    const umkmId = await this._service.addUmkm({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Umkm berhasil ditambahkan',
      data: {
        umkmId,
      },
    });
    response.code(201);
    return response;
  }

  async getUmkmByIdHandler(request) {
    const { id } = request.params;
    const umkm = await this._service.getUmkmById(id);
    return {
      status: 'success',
      data: {
        umkm,
      },
    };
  }

  async putUmkmByIdHandler(request) {
    this._validator.validateUmkmPayload(request.payload);
    const { id } = request.params;

    await this._service.editUmkmById(id, request.payload);

    return {
      status: 'success',
      message: 'Umkm berhasil diperbarui',
    };
  }

  async deleteUmkmByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteUmkmById(id);

    return {
      status: 'success',
      message: 'Umkm berhasil dihapus',
    };
  }
}

module.exports = UmkmsHandler;

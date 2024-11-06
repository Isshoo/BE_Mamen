const autoBind = require('auto-bind');

class ReviewsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postReviewHandler(request, h) {
    this._validator.validateReviewPayload(request.payload);
    const {
      name, review, user_rating,
    } = request.payload;
    const { umkmId: umkms_id } = request.params;
    const user_id = request.auth.credentials.id;

    const reviewId = await this._service.addReview({
      name, review, user_rating, user_id, umkms_id,
    });

    const response = h.response({
      status: 'success',
      message: 'Review berhasil ditambahkan',
      data: {
        reviewId,
      },
    });
    response.code(201);
    return response;
  }

  async getReviewsByUmkmHandler(request) {
    const { umkmId } = request.params;
    const reviews = await this._service.getReviewsByUmkm(umkmId);
    return {
      status: 'success',
      data: {
        reviews,
      },
    };
  }

  async getReviewsHandler() {
    const reviews = await this._service.getAllReviews();
    return {
      status: 'success',
      data: {
        reviews,
      },
    };
  }

  async getReviewByIdHandler(request) {
    const { id } = request.params;
    const review = await this._service.getReviewById(id);
    return {
      status: 'success',
      data: {
        review,
      },
    };
  }

  async deleteReviewByIdHandler(request) {
    const { id } = request.params;
    const { umkmId: umkms_id } = request.params;
    const owner = request.auth.credentials.id;
    await this._service.verifyUmkmOwner(umkms_id, owner);
    await this._service.deleteReviewById(id);

    return {
      status: 'success',
      message: 'Review berhasil dihapus',
    };
  }
}

module.exports = ReviewsHandler;

const { ReviewPayloadSchema } = require('./schema');

const ReviewsValidator = {
  validateReviewPayload: (payload) => {
    const validationResult = ReviewPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },

};

module.exports = ReviewsValidator;

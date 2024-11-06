const { UmkmPayloadSchema, ImageHeadersSchema } = require('./schema');

const UmkmsValidator = {
  validateUmkmPayload: (payload) => {
    const validationResult = UmkmPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },

  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = UmkmsValidator;

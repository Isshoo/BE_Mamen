const { CategoryPayloadSchema } = require('./schema');

const CategoriesValidator = {
  validateProductPayload: (payload) => {
    const validationResult = CategoryPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },

};

module.exports = CategoriesValidator;

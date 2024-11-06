const Joi = require('joi');

const ReviewPayloadSchema = Joi.object({
  name: Joi.string().required(),
  review: Joi.string().required(),
  user_rating: Joi.number().integer().min(1).max(5)
    .required(),
});

module.exports = { ReviewPayloadSchema };

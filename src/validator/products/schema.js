const Joi = require('joi');

const ProductPayloadSchema = Joi.object({
  name: Joi.string().required(),
  product_type: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
});

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/x-icon',
    'image/avif',
    'image/apng',
    'image/webp',
  ).required(),
}).unknown();

module.exports = { ProductPayloadSchema, ImageHeadersSchema };

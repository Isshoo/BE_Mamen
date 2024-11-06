const Joi = require('joi');

const UmkmPayloadSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  subdistrict: Joi.string().required(),
  address: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear())
    .required(),
  contact: Joi.string().required(),
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

module.exports = { UmkmPayloadSchema, ImageHeadersSchema };

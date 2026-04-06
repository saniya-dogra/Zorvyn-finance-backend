const Joi = require("joi");

exports.recordSchema = Joi.object({
  amount: Joi.number().required(),
  type: Joi.string().valid("income", "expense").required(),
  category: Joi.string().required(),
  date: Joi.date().required(),
  notes: Joi.string().optional()
});
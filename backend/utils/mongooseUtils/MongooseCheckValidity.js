const mongoose = require('mongoose');

/**
 * Validates raw data or a Mongoose document against a model schema.
 *
 * @param {mongoose.Model} Model                 - Mongoose model to use for validation.
 * @param {Object|mongoose.Document} docOrData    - Document instance or raw data object.
 * @returns {Promise<{ valid: boolean, invalidFields: string[], doc: mongoose.Document }>}      - Validation result and document.
 */
async function MongooseCheckValidity(Model, docOrData) {
  // Get or instantiate document
  const doc = docOrData instanceof mongoose.Document
    ? docOrData
    : new Model(docOrData);

  let valid = false;
  let invalidFields = [];

  try {
    await doc.validate();
    valid = true;
  } catch (err) {
    if (err.name !== 'ValidationError') throw err;
    // Collect invalid field names
    invalidFields = Object.keys(err.errors);
  }

  return { valid, invalidFields, doc };
}

module.exports = MongooseCheckValidity;

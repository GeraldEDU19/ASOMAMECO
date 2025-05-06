// Enum para status válidos
const ResponseStatus = {
  SUCCESS: "SUCCESS",
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
  ERROR: "ERROR",
  NOT_FOUND: "NOT_FOUND",
  INVALID_DATA: "INVALID_DATA"
};

/**
 * Build a standardized response object for your service methods.
 *
 * @param {Object} params
 * @param {boolean} params.success - Whether the operation succeeded.
 * @param {ResponseStatus} params.status - Status from predefined enum values.
 * @param {string} [params.message] - Custom message key (optional).
 * @param {Object} params.data - Additional data to include in the response.
 * @param {boolean} [params.controlled] - Whether the error is controlled (optional).
 * @returns {Object} Standardized response object
 */
function BuildMethodResponse({
  success = false,
  status = ResponseStatus.ERROR,
  message = "",
  data = {},
  controlled = false
} = {}) {
  // Validate that status is a valid enum value
  if (!Object.values(ResponseStatus).includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${Object.values(ResponseStatus).join(', ')}`);
  }

  // If it's an error and not controlled, use the generic error message key
  if (!success && !controlled) {
    message = "responses.general_error"; // Use the translation key for generic error
  }

  return {
    success,
    status,
    message, // This will now be the key for translation
    data,
    controlled
  };
}

// Attach BuildMethodResponse to the global object
global.BuildMethodResponse = BuildMethodResponse;

module.exports = {
  BuildMethodResponse,
  ResponseStatus
};
  
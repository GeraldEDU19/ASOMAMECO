/**
 * Build a standardized response object for your service methods.
 *
 * @param {Object} params
 * @param {boolean} params.success    – Whether the operation succeeded.
 * @param {string}  params.status     – A short status label (e.g. "Creado", "Actualizado", "Fallido").
 * @param {string}  params.message    – Human-readable description of what happened.
 * @param {string} [params.externalId] – (Opcional) Identificador externo del afiliado.
 * @param {string} [params.fullName]    – (Opcional) Nombre completo del afiliado (o "N/A" si se desconoce).
 * @returns {Object} Response object, sin `externalId` si no se proporcionó.
 */
function BuildMethodResponse({
    success = false,
    status = "Fallido",
    message = "",
    externalId,
    fullName,
    data = {},
  } = {}) {
    // Create the base response with required fields
    const response = { success, status, data };
    
    // Only include externalId if it was provided
    if (externalId !== undefined) {
      response.externalId = externalId;
    }
    if (fullName !== undefined) {
      response.fullName = fullName;
    }
    
    if (message !== undefined) {
      response.message = message;
    }

    return response;
  }
  
  module.exports = BuildMethodResponse
  
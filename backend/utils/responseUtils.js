const { BuildMethodResponse, ResponseStatus } = require('./reponses/BuildMethodResponse');

const buildResponse = (params) => {
  return BuildMethodResponse({
    ...params,
    status: params.status || ResponseStatus.ERROR
  });
};

module.exports = {
  buildResponse,
  ResponseStatus
}; 
const Library = require('./lib');

const API_NAME = 'WD Library API';

function formatter(bodyTemplate, response) {
  return bodyTemplate.call(this, response);
}

module.exports.route = (event, context, callback) => {
  console.info(`[${API_NAME}] Handle request ${JSON.stringify(event)}`);

  const queryString = event.queryStringParameters || {}
  let responseFormatter;

  switch (queryString.format) {
    case 'slack': {
      console.error('Dis is Slack')
      const template = response =>
        JSON.stringify({
          response
        })
      responseFormatter = function defaultFormatter(response) {
        return formatter(template, response)
      }
      break;
    }
    default: {
      console.error('Dis ain\'t Slack')
      const template = response =>
        JSON.stringify({
          response
        })
      responseFormatter = function defaultFormatter(response) {
        return formatter(template, response)
      }
    }
  }

  return new Promise((resolve, reject) => {
    let evaluation;
    switch (event.resource) {
      case '/api/v2/book/{id}':
        evaluation = resolve(Library.get(event.pathParameters.id));
        break;
      case '/api/v2/books/{query}':
        evaluation = resolve(Library.search(event.pathParameters.query.toLowerCase()));
        break;
      case '/api/v2/books':
        evaluation = resolve(Library.list());
        break;
      case '/api/v2/books/add': {
        const body = JSON.parse(event.body);
        if (!Library.validate(body)) {
          evaluation = reject({ message: 'Validation failed for body' });
        }
        evaluation = resolve(Library.add(body));
        break;
      }
      default:
        evaluation = reject({ message: `This route has not been configured ${event.resource}` })
    }
    return evaluation;
  })
  .then(
    response => ({ statusCode: 200, response }),
    error => ({ statusCode: /\[\d{3}\]/[0] || 500, response: { message: error.message } })
  ).then((responseTuple) => {
    console.info(`[${API_NAME}] Handle response ${JSON.stringify(responseTuple)}`);

    responseTuple = responseTuple || DEFAULT_RESPONSE;

    const envelope = {
      statusCode: responseTuple.statusCode,
      body: Object.assign({ input: event }, responseFormatter(responseTuple.response)),
    };

    callback(null, envelope);
  })
}

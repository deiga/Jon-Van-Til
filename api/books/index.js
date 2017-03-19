'use strict';

const Library = require('./lib');

const API_NAME = 'WD Library API';

module.exports.route = (event, context, callback) => {
  console.info(`[${API_NAME}] Handle request ${JSON.stringify(event)}`);

  return new Promise((resolve, reject) => {
    switch(event.resource) {
      case '/api/v2/book/{id}':
        return resolve(Library.get(event.pathParameters.id));
      case '/api/v2/books/{query}':
        return resolve(Library.search(event.pathParameters.query.toLowerCase()));
      case '/api/v2/books':
        return resolve(Library.list());
      case '/api/v2/books/add':
        const body = JSON.parse(event.body);
        if (!Library.validate(body)) {
          reject({ "message": "Validation failed for body"});
        }
        return resolve(Library.add(body));
    }
  })
  .then(
    response => ({ statusCode: 200, response }),
    error => ({ statusCode: /\[\d{3}\]/[0] || 500, response: { message: error.message }})
  ).then(responseTuple => {
    console.info(`[${API_NAME}] Handle response ${JSON.stringify(responseTuple)}`);

    responseTuple = responseTuple || DEFAULT_RESPONSE;

    const envelope = {
      statusCode: responseTuple.statusCode,
      body: JSON.stringify({
        response: responseTuple.response,
        input: event,
      }),
    };

    callback(null, envelope);
  })
}

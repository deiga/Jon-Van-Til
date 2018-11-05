// const qs = require('query-string');
const Library = require('./lib');

const API_NAME = 'WD Library API';
const format = (formatter, ...args) => formatter.apply(this, args);
const partial = (fn, ...args) => fn.bind(null, ...args);
const compose = (f, g) => (...args) => g(f(...args));

const defaultFormatter = (response, input) => JSON.stringify({ response, input });

const slackArrayFormatter = response =>
  response
    .map(item => `\u2022 ${item.name}, ${item.format}, ${item.BookId}\n`)
    .reduce((acc, val) => acc + val, '');
const slackObjectFormatter = response => response;
const slackFormatterBuilder = (response) => {
  if (Array.isArray(response)) {
    return slackArrayFormatter(response);
  }
  if (Object.prototype.hasOwnProperty.call(response, 'BookId')) {
    return slackObjectFormatter(response);
  }
  return response;
};
const slackFormatter = compose(slackFormatterBuilder, defaultFormatter);

module.exports.route = (event, context, callback) => {
  console.info(`[${API_NAME}] Handle request ${JSON.stringify(event)}`);

  const queryString = event.queryStringParameters || {};

  let responseFormatter;

  switch (queryString.format) {
    case 'slack': {
      responseFormatter = partial(format, slackFormatter);
      break;
    }
    default: {
      responseFormatter = partial(format, defaultFormatter);
    }
  }

  return new Promise((resolve, reject) => {
    switch (event.resource) {
      case '/api/v2/book/{id}':
        return resolve(Library.get(event.pathParameters.id));
      case '/api/v2/books/{query}':
        return resolve(Library.search(event.pathParameters.query.toLowerCase()));
      case '/api/v2/books':
        return resolve(Library.list());
      case '/api/v2/books/add': {
        const body = JSON.parse(event.body);
        if (!Library.validate(body)) {
          return reject({ message: 'Validation failed for body' });
        }
        return resolve(Library.add(body));
      }
      case '/api/v2/slack/library': {
        console.log('This is slack');
        const slackPayload = JSON.parse(event.body);
        if (slackPayload.text.length === 0) {
          return resolve(Library.list());
        }
        const params = slackPayload.text.split(" ");
        const action = params[0];
        console.log(params);
        switch (action) {
          case 'list':
            return resolve(Library.list());
          case 'add': {
            const body = JSON.parse(event.body);
            if (!Library.validate(body)) {
              return reject({ message: 'Validation failed for body' });
            }
            return resolve(Library.add(body));
          }
          case 'get':
            return resolve(Library.get(params[1]));
          case 'search':
            return resolve(Library.search(params[1].toLowerCase()));
          default:
            return reject({ message: `This route has not been configured ${slackPayload.command}:${slackPayload.text}` });
        }
      }
      default:
        return reject({ message: `This route has not been configured ${event.resource}` });
    }
  })
  .then(
    response => ({ statusCode: 200, response }),
    error => ({ statusCode: /\[\d{3}\]/[0] || 500, response: { message: error.message } })
  ).then((responseTuple) => {
    console.info(`[${API_NAME}] Handle response ${JSON.stringify(responseTuple)}`);

    const formattedResponse = responseFormatter(responseTuple.response, event);

    const envelope = {
      statusCode: responseTuple.statusCode,
      body: formattedResponse,
    };

    callback(null, envelope);
  });
}

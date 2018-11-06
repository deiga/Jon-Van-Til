// const qs = require('query-string');
import { get, search, list, validate, add } from './lib';
import { partial } from './util'
import { format, slackFormatter, defaultFormatter } from './format';

const API_NAME = 'WD Library API';
async function handleRequest(event) {

  switch (event.resource) {
    case '/api/v2/book/{id}':
      return await get(event.pathParameters.id);
    case '/api/v2/books/{query}':
      return await search(event.pathParameters.query.toLowerCase());
    case '/api/v2/books':
      return await list();
    case '/api/v2/books/add':
      return await handleBooksAddRequest(event)
    case '/api/v2/slack/library':
      return await handleSlackRequest(event.body)
    default:
      throw new Error(`This route has not been configured ${event.resource}`);
  }
}

async function handleBooksAddRequest(event) {
  let body;
  if (typeof event.body === 'object') {
    body = event.body;
  } else {
    body = JSON.parse(event.body);
  }

  if (!validate(body)) {
    throw {
      message: 'Validation failed for body'
    };
  }
  return await add(body);
}

async function handleSlackRequest(eventBody) {
  console.log('This is slack');
  const slackPayload = JSON.parse(eventBody);
  if (slackPayload.text.length === 0) {
    return await list();
  }
  const params = slackPayload.text.split(" ");
  const action = params[0];
  console.log(params);
  switch (action) {
    case 'list':
      return await list();
    case 'add':
      return await handleBooksAddRequest(event)
    case 'get':
      return await get(params[1]);
    case 'search':
      return await search(params[1].toLowerCase());
    default:
      throw new Error(`This route has not been configured ${slackPayload.command}:${slackPayload.text}`);
    }
}

export async function route(event, context, callback) {
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

  let responseTuple = {};
  try {

    const response = await handleRequest(event);
    responseTuple = {
      statusCode: 200,
      response
    }
  } catch(e) {
      responseTuple = {
        statusCode: /\[\d{3}\]/ [0] || 500,
        response: {
          message: e.message
        }
      }
  }
    console.info(`[${API_NAME}] Handle response ${JSON.stringify(responseTuple)}`);

    const formattedResponse = responseFormatter(responseTuple.response, event);

    const envelope = {
      statusCode: responseTuple.statusCode,
      body: formattedResponse,
    };

    return callback(null, envelope);
}

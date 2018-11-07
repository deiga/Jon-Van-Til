import {
  compose,
} from './util';
export const format = (formatter, ...args) => formatter.apply(this, args);
export const defaultFormatter = (response, input) => JSON.stringify({
  response,
  input,
});
const slackArrayFormatter = response => response
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
export const slackFormatter = compose(slackFormatterBuilder, defaultFormatter);

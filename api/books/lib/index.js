const AWS = require('aws-sdk');

AWS.config.update({
  region: 'eu-west-1',
});
const dynamoDB = new AWS.DynamoDB();
const dynogels = require('dynogels-promisified');

dynogels.dynamoDriver(dynamoDB);
// dynogels.log.level('debug');
const Joi = require('joi');

const Books = dynogels.define('Books', {
  hashKey: 'BookId',
  timestamps: true,
  tableName: 'Books',
  schema: {
    BookId: dynogels.types.uuid(),
    name: Joi.string(),
    format: Joi.string(),
  },
  indexes: [{
    hashKey: 'name',
    rangeKey: 'format',
    name: 'NameFormatIndex',
    type: 'global',
  }],
});

dynogels.createTables((err) => {
  if (err) {
    console.log('Error creating tables: ', err);
  } else {
    console.log('Tables has been created');
  }
});

export async function get(bookId) {
  return Books.getAsync(bookId);
}

export async function list() {
  const results = await Books.scan().loadAll().execAsync();
  const bookModels = results.Items;

  return bookModels.map(model => model.attrs);
}

export async function add(body) {
  return Books.createAsync(body);
}

export function validate(body) {
  return !(typeof body === 'undefined' ||
    typeof body.name === 'undefined' ||
    typeof body.format === 'undefined');
}

const filterBookNameByQuery = (book, query) => book.name.toLowerCase().includes(query);
const filterBookFormatByQuery = (book, query) => book.format.toLowerCase().includes(query);
function filterByNameAndFormat(book, query) {
  return filterBookNameByQuery(book, query) || filterBookFormatByQuery(book, query);
}


export async function search(query) {
  const books = await list();

  return books.filter(book => filterByNameAndFormat(book, query));
}

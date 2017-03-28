const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-west-1' });
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
  indexes: [
    {
      hashKey: 'name',
      rangeKey: 'format',
      name: 'NameFormatIndex',
      type: 'global',
    },
  ],
});

dynogels.createTables((err) => {
  if (err) {
    console.log('Error creating tables: ', err);
  } else {
    console.log('Tables has been created');
  }
});

function get(bookId) {
  return Books.getAsync(bookId);
}

function list() {
  return Books
    .scan()
    .loadAll()
    .execAsync()
    .then(res => res.Items)
    .then(books => books.map(model => model.attrs));
}

function add(body) {
  return Books.createAsync(body);
}

function validate(body) {
  return !(typeof body === 'undefined'
    || typeof body.name === 'undefined'
    || typeof body.format === 'undefined');
}

const filterBookNameByQuery = (book, query) => book.name.toLowerCase().includes(query);
const filterBookFormatByQuery = (book, query) => book.format.toLowerCase().includes(query);
const filterByNameAndFormat = (book, query) => filterBookNameByQuery(book, query) || filterBookFormatByQuery(book, query);

function search(query) {
  return list()
    .then(books => books.filter(book => filterByNameAndFormat(book, query)));
}

module.exports = {
  get: get,
  list: list,
  validate: validate,
  add: add,
  search: search,
};

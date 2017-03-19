'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const dynamoDB = new AWS.DynamoDB();
const vogels = require('vogels-promisified');
vogels.dynamoDriver(dynamoDB);
const Joi = require('joi');

const Books = vogels.define('Books', {
  hashKey: 'BookId',
  timestamps: true,
  tableName: 'Books',
  schema: {
    BookId: vogels.types.uuid(),
    name: Joi.string(),
    format: Joi.string(),
  },
  indexes: [
    {
      hashKey: 'name',
      rangeKey: 'format',
      name: 'NameFormatIndex',
      type: 'global'
    }
  ]
});

vogels.createTables((err) => {
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
    .then((book) => {
      return book.Items.map((item) => {
        return `\u2022 ${item.attrs.name}, ${item.attrs.format}, ${item.attrs.BookId}\n`
      }).reduce((acc, val) => {
        return acc + val
      }, '')
    })
}

function add(body) {
  return Books.createAsync(body);
}

function validate(body) {
  return !(typeof body == 'undefined'
    || typeof body.name == 'undefined'
    || typeof body.format == 'undefined')
}

function search(query) {
  return Books
    .scan()
    .loadAll()
    .execAsync()
    .then((books) => {
      return books.Items.map((model) => model.attrs).filter((book) => {
        return book.name.toLowerCase().includes(query) || book.format.toLowerCase().includes(query);
      });
    })
}

module.exports = {
  get: get,
  list: list,
  validate: validate,
  add: add,
  search: search
}

'use strict';

var AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
var dynamoDB = new AWS.DynamoDB();
var vogels = require('vogels');
vogels.dynamoDriver(dynamoDB);
var Joi = require('joi');

var Books = vogels.define('Books', {
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

module.exports.add = (event, context, cb) => {
  console.log("Enter", event, context, cb);
  if (typeof event.body == 'undefined'
    || typeof event.body.name == 'undefined'
    || typeof event.body.format == 'undefined'
  ) {
    cb('Missin parameters', null);
  }
  Books.create(event.body, (err, book) => {
    cb(null, { message: 'Added a book!', book, err });
  });
}

module.exports.list = (event, context, cb) => {
  Books.scan().loadAll().exec((err, result) => {
    cb(null, { message: 'Listing all books', event, err, result });
  });
};

module.exports.get = (event, context, cb) => cb(null,
  { message: 'Getting a book!', event }
);

module.exports.search = (event, context, cb) => {
  Books.scan().loadAll().exec((err, result) => {
    cb(null, { message: 'Searching for books!', event, err, result } );
  });
}

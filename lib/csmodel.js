var _ = require('lodash')
    , util = require('util')
    , q = require('q')
    , CModel = require('./cmodel');

/**
 * CSModel - A collection class for using with {@link CStore}.
 * @constructor
 * @param {object} opts (optional) - An object holding options for creating a
 * new CSModel instance. At the moment, the only valid option is a 'name' for the
 * collection.
 * @param {array} data (optional) - An array of objects, representing the collection.
 * @example
 * var CStore = require('node-cstore');
 * var model = new CStore.CSModel({name: 'MyCollection'});
 */
function CSModel(opts, data) {
    CModel.apply(this, [opts, data]);
}

util.inherits(CSModel, CModel);

CSModel.prototype.__defineGetter__('classname', function() { return 'CSModel'; });

CSModel.prototype.toString = function() {
    return CSModel.super_.prototype.toString.apply(this);
};

/**
 * @method CSModel.insert
 * @param {object} doc - The document to insert in the collection.
 * @return {object} - The inserted document with generated '_id' field.
 * @description Inserts a new document into the collection and giving it
 * an id field.
 */
CSModel.prototype.insert = function(doc) {
    return CSModel.super_.prototype.insert.call(this, doc);
};

/**
 * @method CSModel.findbyid
 * @param {string} id - The id of the object to looking for.
 * @return {object} - A single document or 'undefined', if nothing found.
 * @description Find an object by its id field.
 */
CSModel.prototype.findById = function(id) {
    return CSModel.super_.prototype.findById.call(this, id);
};

/**
 * @method CSModel.find
 * @param {object} query - A search field or a query.
 * @return {array} - The found document or an empty array.
 * @description Find all documents matching a simple field/value comparation or a
 * complexer query in the form of '{field: {'$comparator': 'value'}}'. At the moment,
 * the comparator functions '$eq' (equal), '$ne' (not equal), '$gt' (greater than),
 * '$lt' (less than) and '$in' (member of a list of items) are implemented.
 * A special comparator is the '$or' one, which is looking for a field/value OR another
 * field/value.
 * @example
 * var CStore = require('node-cstore');
 * var model = new CStore.CSModel();
 *
 * model.insert({dress: '$noir', material: 'silk'});
 * var items = model.find({dress: '$noir'}); //simple field/value
 *
 * var items = model.find({dress: {'$eq': '$noir'}}); //simple query
 * var items = model.find({dress: {'$eq': '$noir'}, material: {'$eq': 'silk'}}); //AND
 * var items = model.find({'$or': {dress: {'$eq': '$noir'}, material: {'$eq': 'silk'}}}); //OR
 */
CSModel.prototype.find = function(query) {
    return CSModel.super_.prototype.find.call(this, query);
};

/**
 * @method CSModel.findOne
 * @param {object} query - See {@link CSModel.find} for valid queries.
 * @return {object} - The found document or 'undefined', if no results.
 * @description Find the first valid document for a query.
 */
CSModel.prototype.findOne = function(query) {
    return CSModel.super_.prototype.findOne.call(this, query);
};

/**
 * @method CSModel.update
 * @param {object} query - See {@link CSModel.find} for valid queries.
 * @param {object} doc - The document to merge with the query results.
 * @return {array} - An array of updated documents.
 * @description Update documents in the collection and return these
 * updated documents.
 */
CSModel.prototype.update = function(query, doc) {
    return CSModel.super_.prototype.update.call(this, query, doc);
};

/**
 * @method CSModel.updateById
 * @param {string} id - The identifier of the document to update.
 * @param {object} doc - The document to merge with the query result.
 * @return {object} - The updated document.
 * @description Update a single document by a given identifier and return
 * the updated document.
 */
CSModel.prototype.updateById = function(id, doc) {
    return CSModel.super_.prototype.updateById.call(this, id, doc);
};

/**
 * @method CSModel.delete
 * @param {object} query - See {@link CSModel.find} for valid queries.
 * @return {array} - An array of documents to be delete.
 * @description Delete documents in the collection and return these
 * deleted documents.
 */
CSModel.prototype.delete = function(query) {
    return CSModel.super_.prototype.delete.call(this, query);
};

/**
 * @method CSModel.deleteById
 * @param {string} id - The identifier of the document to update.
 * @return {object} - The deleted document.
 * @description Delete a single document by a given identifier and return
 * the deleted document.
 */
CSModel.prototype.deleteById = function(id) {
    return CSModel.super_.prototype.deleteById.call(this, id);
};

module.exports = CSModel;

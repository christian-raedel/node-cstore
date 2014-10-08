var _ = require('lodash')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , q = require('q')
    , shortid = require('shortid')
    , findops = require('./find-ops')
    , CConf = require('node-cconf')
    , CModel = require('./cmodel');

/**
 * CQModel - A collection class for using with {@link CStore}.
 * All methods returning a value, return a promise for that value.
 * Thereby its an asynchron version of {@link CModel}.
 * @constructor
 * @param {object} opts (optional) - An object holding options for creating a
 * new CQModel instance. At the moment, the only valid option is a 'name' for the
 * collection.
 * @param {array} data (optional) - An array of objects, representing the collection.
 * @example
 * var CStore = require('node-cstore');
 * var model = new CStore.CQModel({name: 'MyCollection'});
 */
function CQModel(opts, data) {
    CModel.apply(this, [opts, data]);
}

util.inherits(CQModel, CModel);

CQModel.prototype.__defineGetter__('classname', function() { return 'CQModel'; });

CQModel.prototype.toString = function() {
    return CQModel.super_.prototype.toString.apply(this);
};

/**
 * @method CQModel.insert
 * @param {object} doc - The document to insert in the collection.
 * @return {object} - The inserted document with generated '_id' field.
 * @description Inserts a new document into the collection and giving it
 * an id field.
 */
CQModel.prototype.insert = function(doc) {
    return q.fcall(CQModel.super_.prototype.insert.bind(this), doc);
};

/**
 * @method CQModel.findbyid
 * @param {string} id - The id of the object to looking for.
 * @return {object} - A single document or 'undefined', if nothing found.
 * @description Find an object by its id field.
 */
CQModel.prototype.findById = function(id) {
    return q.fcall(CQModel.super_.prototype.findById.bind(this), id);
};

/**
 * @method CQModel.find
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
 * var model = new CStore.CQModel();
 *
 * model.insert({dress: '$noir', material: 'silk'});
 * var items = model.find({dress: '$noir'}); //simple field/value
 *
 * var items = model.find({dress: {'$eq': '$noir'}}); //simple query
 * var items = model.find({dress: {'$eq': '$noir'}, material: {'$eq': 'silk'}}); //AND
 * var items = model.find({'$or': {dress: {'$eq': '$noir'}, material: {'$eq': 'silk'}}}); //OR
 */
CQModel.prototype.find = function(query) {
    return q.fcall(CQModel.super_.prototype.find.bind(this), query);
};

/**
 * @method CQModel.findOne
 * @param {object} query - See {@link CQModel.find} for valid queries.
 * @return {object} - The found document or 'undefined', if no results.
 * @description Find the first valid document for a query.
 */
CQModel.prototype.findOne = function(query) {
    return q.fcall(CQModel.super_.prototype.findOne.bind(this), query);
};

/**
 * @method CQModel.update
 * @param {object} query - See {@link CQModel.find} for valid queries.
 * @param {object} doc - The document to merge with the query results.
 * @return {array} - An array of updated documents.
 * @description Update documents in the collection and return these
 * updated documents.
 */
CQModel.prototype.update = function(query, doc) {
    return q.fcall(CQModel.super_.prototype.update.bind(this), query, doc);
};

/**
 * @method CQModel.updateById
 * @param {string} id - The identifier of the document to update.
 * @param {object} doc - The document to merge with the query result.
 * @return {object} - The updated document.
 * @description Update a single document by a given identifier and return
 * the updated document.
 */
CQModel.prototype.updateById = function(id, doc) {
    return q.fcall(CQModel.super_.prototype.updateById.bind(this), id, doc);
};

/**
 * @method CQModel.delete
 * @param {object} query - See {@link CQModel.find} for valid queries.
 * @return {array} - An array of documents to be delete.
 * @description Delete documents in the collection and return these
 * deleted documents.
 */
CQModel.prototype.delete = function(query) {
    return q.fcall(CQModel.super_.prototype.delete.bind(this), query);
};

/**
 * @method CQModel.deleteById
 * @param {string} id - The identifier of the document to update.
 * @return {object} - The deleted document.
 * @description Delete a single document by a given identifier and return
 * the deleted document.
 */
CQModel.prototype.deleteById = function(id) {
    return q.fcall(CQModel.super_.prototype.deleteById.bind(this), id);
};

module.exports = CQModel;

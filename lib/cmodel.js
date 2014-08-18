var _ = require('lodash')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , shortid = require('shortid')
    , findops = require('./find-ops')
    , CConf = require('node-cconf').CConf
    , clogger = require('node-clogger');

/**
 * CModel - A collection class for using with {@link CStore}.
 * @constructor
 * @param {object} opts (optional) - An object holding options for creating a
 * new CModel instance. At the moment, the only valid option is a 'name' for the
 * collection.
 * @param {array} data (optional) - An array of objects, representing the collection.
 * @example
 * var cstore = require('node-cstore');
 * var model = new cstore.CModel({name: 'MyCollection'});
 */
function CModel(opts, data) {
    opts = opts || {};
    opts.name = opts.name || 'cmodel';

    var config = new CConf(opts.name).load(opts);

    EventEmitter.apply(this);

    this.config = config;
    this.data = data || [];
}

/**
 * @event CModel#insert
 * @property {object} - An added document.
 * @description This event is fired on inserting new documents.
 */
/**
 * @event CModel#update
 * @property {array} - A list of updated documents.
 * @description This event is fired on updating documents.
 */
/**
 * @event CModel#delete
 * @property {array} - A list of deleted documents.
 * @description This event is fired on deleting documents.
 */
util.inherits(CModel, EventEmitter);

/**
 * @method CModel.insert
 * @param {object} doc - The document to insert in the collection.
 * @return {object} - The inserted document with generated '_id' field.
 * @description Inserts a new document into the collection and giving it
 * an id field.
 */
CModel.prototype.insert = function(doc) {
    if (_.isPlainObject(doc)) {
        doc['_id'] = shortid.generate();
        this.data.push(doc);
        this.emit('insert', doc);
        return doc;
    } else {
        throw new TypeError('CModel.insert accepts only an object as argument!');
    }
};

/**
 * @method CModel.findbyid
 * @param {string} id - The id of the object to looking for.
 * @return {object} - A single document or 'undefined', if nothing found.
 * @description Find an object by its id field.
 */
CModel.prototype.findById = function(id) {
    if (_.isString(id)) {
        var data = this.data
            , i = data.length;

        while(i > 0) {
            var obj = data[i - 1];
            if (obj['_id'] === id) {
                return obj;
            }
            i--;
        }
    } else {
        throw new TypeError('CModel.findById accepts only strings as arguments!');
    }

    return undefined;
};

/**
 * @method CModel.find
 * @param {object} query - A search field or a query.
 * @return {array} - The found document or an empty array.
 * @description Find all documents matching a simple field/value comparation or a
 * complexer query in the form of '{field: {'$comparator': 'value'}}'. At the moment,
 * the comparator functions '$eq' (equal), '$ne' (not equal), '$gt' (greater than),
 * '$lt' (less than) and '$in' (member of a list of items) are implemented.
 * A special comparator is the '$or' one, which is looking for a field/value OR another
 * field/value.
 * @example
 * var cstore = require('node-cstore');
 * var model = new cstore.CModel();
 *
 * model.insert({dress: '$noir', material: 'silk'});
 * var items = model.find({dress: '$noir'}); //simple field/value
 *
 * var items = model.find({dress: {'$eq': '$noir'}}); //simple query
 * var items = model.find({dress: {'$eq': '$noir'}, material: {'$eq': 'silk'}}); //AND
 * var items = model.find({'$or': {dress: {'$eq': '$noir'}, material: {'$eq': 'silk'}}}); //OR
 */
CModel.prototype.find = function(query) {
    var result = [];

    if (_.isPlainObject(query)) {
        result = this.data.filter(function(doc) {
            var found = true;

            _.forOwn(query, function(query, field) {
                if (_.isPlainObject(query)) {
                    if (field === '$or') {
                        _.forOwn(query, function(query, field) {
                            _.forOwn(query, function(value, op) {
                                found = found || findops[op].apply(null, [doc[field], value]);
                            });
                        });
                    } else {
                        _.forOwn(query, function(value, op) {
                            found = findops[op].apply(null, [doc[field], value]);
                        });
                    }
                } else {
                    found = found && _.isEqual(doc[field], query);
                }
            });

            return found;
        });
    } else {
        throw new TypeError('CModel.find accepts only an object as argument!');
    }

    return _.uniq(result, '_id');
};

/**
 * @method CModel.update
 * @param {object} query - See {@link CModel.find} for valid queries.
 * @param {object} doc - The document to merge with the query results.
 * @return {array} - An array of updated documents.
 * @description Update documents in the collection and return these
 * updated documents.
 */
CModel.prototype.update = function(query, doc) {
    var result = [];

    if (_.isPlainObject(query) && _.isPlainObject(doc)) {
        result = this.find(query);

        _.forEach(result, function(item) {
            item = _.merge(item, doc);
        });
    } else {
        throw new TypeError('CModel.update accepts only objects as arguments!');
    }

    if (result.length) {
        this.emit('update', result);
    }
    return result;
};

/**
 * @method CModel.delete
 * @param {object} query - See {@link CModel.find} for valid queries.
 * @return {array} - An array of documents to be delete.
 * @description Delete documents in the collection and return these
 * deleted documents.
 */
CModel.prototype.delete = function(query) {
    var result = [];

    if (_.isPlainObject(query)) {
        result = this.find(query);

        var remove = result.map(function(doc) {
            return doc['_id'];
        });

        this.data = this.data.filter(function(doc) {
            return _.indexOf(remove, doc['_id']) > -1 ? false : true;
        });
    } else {
        throw new TypeError('CModel.delete accepts only an object as argument!');
    }

    if (result.length) {
        this.emit('delete', result);
    }
    return result;
};

module.exports = CModel;

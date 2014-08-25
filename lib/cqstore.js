var _ = require('lodash')
    , util = require('util')
    , sprintf = util.format
    , fs = require('fs')
    , path = require('path')
    , q = require('q')
    , CConf = require('node-cconf')
    , CLogger = require('node-clogger')
    , CQModel = require('./cqmodel')
    , CStore = require('./cstore');

/**
 * CQStore - A document store.
 * @constructor
 * @param {object} opts (optional) - Arguments for creating a new CQStore instance.
 * Valid options are a 'name', a 'filename' for persisting the document store and a
 * [CLogger]{@link http://christian-raedel.github.io/node-clogger/index.html} instance.
 * If filename is omitted, the datastore is inmemory only. With no given logger, the
 * constructor will create a new one.
 * @param {array} models (optional) - A list with {@link CModel} instances for
 * holding the data.
 * @example
 * var CQStore = require('node-cstore');
 * var store = new CQStore({name: '$apple'}, {
 *      'mac-books': new CQStore.CModel()
 * });
 */
function CQStore(opts, models) {
    CStore.apply(this, [opts, models]);
}

util.inherits(CQStore, CStore);

CQStore.prototype.__defineGetter__('classname', function() { return 'CQStore'; });

CQStore.prototype.__defineGetter__('ModelConstructor', function() { return CQModel; });

CQStore.prototype.toString = function() {
    return CQStore.super_.prototype.toString.apply(this);
};

/**
 * @method CQStore.addModel
 * @param {object} model - An instance of {@link CModel} which will be inserted.
 * @return {object} this
 * @description Add a new collection to the datastore.
 */
CQStore.prototype.addModel = function(model) {
    return q.fcall(CQStore.super_.prototype.addModel.bind(this), model);
};

/**
 * @method CQStore.commit
 * @return {object} this
 * @description Read changes from swapfile into models and delete swapfile.
 */
CQStore.prototype.commit = function() {
    return q.fcall(CQStore.super_.prototype.commit.bind(this));
};

/**
 * @method CQStore.save
 * @return {object} this
 * @description Persist datastore to disk.
 */
CQStore.prototype.save = function() {
    return q.fcall(CQStore.super_.prototype.save.bind(this));
};

/**
 * @method CQStore.load
 * @return {object} this
 * @description Load datastore from file.
 */
CQStore.prototype.load = function() {
    return q.fcall(CQStore.super_.prototype.load.bind(this));
};

/**
 * @method CQStore.getModel
 * @param {string} name - The name of the model to retrieve.
 * @return {object} - An {@link CModel} instance with given name.
 * @description Retrieve a model with given name from the datastore.
 */
CQStore.prototype.getModel = function(name) {
    return q.fcall(CQStore.super_.prototype.getModel.bind(this), name);
};

module.exports = CQStore;

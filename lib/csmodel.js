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

module.exports = CSModel;

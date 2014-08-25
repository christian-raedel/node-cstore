var _ = require('lodash')
    , util = require('util')
    , sprintf = util.format
    , fs = require('fs')
    , CConf = require('node-cconf')
    , CLogger = require('node-clogger')
    , CSModel = require('./csmodel');

/**
 * CStore - A document store.
 * @constructor
 * @param {object} opts (optional) - Arguments for creating a new CStore instance.
 * Valid options are a 'name', a 'filename' for persisting the document store and a
 * [CLogger]{@link http://christian-raedel.github.io/node-clogger/index.html} instance.
 * If filename is omitted, the datastore is inmemory only. With no given logger, the
 * constructor will create a new one.
 * @param {array} models (optional) - A list with {@link CModel} instances for
 * holding the data.
 * @example
 * var CStore = require('node-cstore');
 * var store = new CStore({name: '$apple'}, {
 *      'mac-books': new CStore.CModel()
 * });
 */
function CStore(opts, models) {
    opts = opts || {};
    opts.name = opts.name || 'cstore';

    if (opts.logger && opts.logger instanceof CLogger) {
        opts.logger.extend(this);
        delete opts.logger;
    } else {
        var logger = new CLogger(opts.name, {
            transports: [
                new CLogger.transports.Console()
            ],
            visible: ['info', 'warn', 'debug', 'error']
        });
        logger.extend(this);
    }

    var config = new CConf(opts.name).load(opts || {});

    this.models = {};
    if (_.isArray(models)) {
        _.forEach(models, function(model) {
            this.addModel(model);
        });
    }

    this.config = config;
    this.createSwapfile();
}

CStore.prototype.__defineGetter__('classname', function() { return 'CStore'; });

CStore.prototype.__defineGetter__('ModelConstructor', function() { return CSModel; });

CStore.prototype.toString = function() {
    return sprintf('%s [%s]', this.classname, this.config.getValue('name'));
};

/**
 * @method CStore.createSwapfile
 * @private
 * @description Create a write stream to the swapfile.
 */
CStore.prototype.createSwapfile = function() {
    var filename = this.config.getValue('filename');
    if (_.isString(filename)) {
        try {
            this.stream = fs.createWriteStream(filename.concat('.swp'), {mode: 0600, flags: 'a', encoding: 'utf8'});
        } catch (err) {
            this.error('Unable to append to file [%s]! Inmemory only...', filename);
        }
    } else {
        this.warn('No valid filename supplied! %s is inmemory only...', this);
    }
};

/**
 * @method CStore.addModel
 * @param {object} model - An instance of {@link CModel} which will be inserted.
 * @return {object} this
 * @description Add a new collection to the datastore.
 */
CStore.prototype.addModel = function(model) {
    if (model instanceof this.ModelConstructor) {
        _.forEach(['insert', 'update', 'delete'], function(mode) {
            var self = this;

            model.on(mode, function(data) {
                self.write(model, mode, data);
            });
        }, this);

        this.models[model.config.getValue('name')] = model;
    } else {
        throw new TypeError(sprintf('%s models must be instances of %s!', this, this.ModelConstructor.prototype.classname));
    }

    return this;
};

/**
 * @method CStore.write
 * @private
 * @description Write collection changes to the swapfile.
 */
CStore.prototype.write = function(model, mode, data) {
    if (model instanceof this.ModelConstructor && ['insert', 'update', 'delete'].indexOf(mode) > -1 && _.isPlainObject(data)) {
        var stream = this.stream;
        if (stream) {
            var str = JSON.stringify({
                model: model.config.getValue('name'),
                mode: mode,
                data: data
            }); //.concat('\n');
            stream.write(str);
        } else {
            this.error('Cannot write to datastore!');
        }
    } else {
        this.error('Invalid arguments to write to datastore!');
    }

    return this;
};

/**
 * @method CStore.commit
 * @return {object} this
 * @description Read changes from swapfile into models and delete swapfile.
 */
CStore.prototype.commit = function() {
    var filename = this.config.getValue('filename')
        , swapname = filename.concat('.swp');

    var stream = this.stream;
    if (stream) {
        stream.end();
    }

    if (fs.statSync(swapname).isFile()) {
        try {
            stream = fs.createReadStream(swapname, {encoding: 'utf8'});

            var self = this;
            stream.on('data', function(chunk) {
                _.forEach(chunk.split('\n'), function(line) {
                    var obj = JSON.parse(line);

                    var model = self.models[obj.model];
                    if (model instanceof self.ModelConstructor) {
                        switch (obj.mode) {
                            case 'insert':
                                if (!model.findById(obj.data['_id'])) {
                                    model.data.push(obj.data);
                                }
                                break;
                            case 'update':
                                var data = model.findById(obj.data['_id']);
                                if (_.isPlainObject(data)) {
                                    data = obj.data;
                                }
                                break;
                            case 'delete':
                                model.data = model.data.filter(function(data) {
                                    return data['_id'] !== obj.data['_id'];
                                });
                                break;
                            default:
                                throw new TypeError('Invalid mode!');
                        }
                    } else {
                        self.warn('Model [%s] is not part of datastore!', obj.model);
                    }
                }, this);
            });

            stream.on('end', function() {
                fs.unlinkSync(swapname);
                self.createSwapfile();
            });
        } catch(err) {
            this.error('Unable to read swapfile [%]! Reason: [%s]', swapname, err.message);
        }
    }

    return this;
};

/**
 * @method CStore.save
 * @return {object} this
 * @description Persist datastore to disk.
 */
CStore.prototype.save = function() {
    var filename = this.config.getValue('filename');

    try {
        var data = {};
        _.forOwn(this.models, function(model, key) {
            data[key] = model.data;
        });

        var str = JSON.stringify(data);
        fs.writeFileSync(filename, str, {encoding: 'utf8'});
    } catch(err) {
        throw new Error('Unable to persist datastore to file [' + filename + ']! Reason: ' + err.message);
    }

    return this;
};

/**
 * @method CStore.load
 * @return {object} this
 * @description Load datastore from file.
 */
CStore.prototype.load = function() {
    var filename = this.config.getValue('filename');

    try {
        var data = fs.readFileSync(filename, {encoding: 'utf8'})
            , obj = JSON.parse(data);
        _.forOwn(obj, function(data, key) {
            var model = this.models[key];
            if (model instanceof this.ModelConstructor) {
                model.data = data;
            } else {
                model = new this.ModelConstructor({name: key}, data);
                this.models[key] = model;
            }
        }, this);
    } catch(err) {
        throw new Error('Unable to load datastore from file [' + filename + ']! Reason: ' + err.message);
    }

    return this;
};

/**
 * @method CStore.getModel
 * @param {string} name - The name of the model to retrieve.
 * @return {object} - An {@link CModel} instance with given name.
 * @description Retrieve a model with given name from the datastore.
 */
CStore.prototype.getModel = function(name) {
    if (_.isString(name)) {
        var models = this.models;

        if (models.hasOwnProperty(name)) {
            return models[name];
        }
    } else {
        throw new TypeError(sprintf('%s.getModel accepts only a string as an argument!', this));
    }

    return undefined;
};

module.exports = CStore;

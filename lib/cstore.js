var _ = require('lodash')
    , fs = require('fs')
    , CConf = require('node-cconf').CConf
    , clogger = require('node-clogger')
    , CModel = require('./cmodel');

function CStore(opts) {
    opts = opts || {};
    opts.name = opts.name || 'cstore';

    if (opts.logger && opts.logger instanceof clogger.CLogger) {
        opts.logger.extend(this);
        delete opts.logger;
    } else {
        var logger = new clogger.CLogger(opts.name, {
            transports: [
                new clogger.transports.Console()
            ],
            visible: ['info', 'warn', 'debug', 'error']
        });
        logger.extend(this);
    }

    var config = new CConf(opts.name).load(opts || {});

    var filename = config.getValue('filename');
    if (_.isString(filename)) {
        try {
            this.stream = fs.createWriteStream(filename.concat('.swp'), {mode: 0600, flags: 'a', encoding: 'utf8'});
        } catch (err) {
            this.error('Unable to append to file [%s]! Inmemory only...', filename);
        }
    }

    this.config = config;
    this.models = {};
}

CStore.prototype.addModel = function(model) {
    if (model instanceof CModel) {
        _.forEach(['insert', 'update', 'delete'], function(mode) {
            var self = this;

            model.on(mode, function(data) {
                self.write(model, mode, data);
            });
        }, this);

        this.models[model.config.getValue('name')] = model;
    } else {
        throw new TypeError('CStore models must be instances of CModel!');
    }

    return this;
};

CStore.prototype.write = function(model, mode, data) {
    if (model instanceof CModel && ['insert', 'update', 'delete'].indexOf(mode) > -1 && _.isPlainObject(data)) {
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

CStore.prototype.commit = function() {
    var filename = this.config.getValue('filename')
        , swapname = filename.concat('.swp');

    var stream = this.stream;
    if (stream) {
        stream.end();
    }

    if (fs.statSync(swapname).isFile()) {
        try {
            var stream = fs.createReadStream(swapname, {encoding: 'utf8'});

            var self = this;
            stream.on('data', function(chunk) {
                _.forEach(chunk.split('\n'), function(line) {
                    var obj = JSON.parse(line);

                    var model = self.models[obj.model];
                    if (model instanceof CModel) {
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
            });
        } catch(err) {
            this.error('Unable to read swapfile [%]! Reason: [%s]', swapname, err.message);
        }
    }

    return this;
}

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
}

CStore.prototype.load = function() {
    var filename = this.config.getValue('filename');

    try {
        var data = fs.readFileSync(filename, {encoding: 'utf8'})
            , obj = JSON.parse(data);
        _.forOwn(obj, function(data, key) {
            var model = this.models[key];
            if (model instanceof CModel) {
                model.data = data;
            } else {
                model = new CModel({name: key}, data);
                this.models[key] = model;
            }
        }, this);
    } catch(err) {
        throw new Error('Unable to load datastore from file [' + filename + ']! Reason: ' + err.message);
    }

    return this;
}

module.exports = CStore;

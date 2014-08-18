var _ = require('lodash')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , shortid = require('shortid')
    , findops = require('./find-ops')
    , CConf = require('node-cconf').CConf
    , clogger = require('node-clogger');

function CModel(opts, data) {
    opts = opts || {};
    opts.name = opts.name || 'cmodel';

    var config = new CConf(opts.name).load(opts);

    EventEmitter.apply(this);

    this.config = config;
    this.data = data || [];
}

util.inherits(CModel, EventEmitter);

CModel.prototype.insert = function(data) {
    if (_.isPlainObject(data)) {
        data['_id'] = shortid.generate();
        this.data.push(data);
        this.emit('insert', data);
        return data;
    }

    return undefined;
};

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
}

// {dress: '$noir'} // {dress: {'$eq': '$noir'}} // '$or'/'$and'
CModel.prototype.find = function(args) {
    var result = [];

    if (_.isPlainObject(args)) {
        result = this.data.filter(function(doc) {
            var found = true;

            _.forOwn(args, function(query, field) {
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
}

module.exports = CModel;

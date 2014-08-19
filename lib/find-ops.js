var _ = require('lodash');

function $gt(value, comp) {
    if ((_.isNumber(value) && _.isNumber(comp)) || (_.isString(value) && _.isString(comp))) {
        return value > comp;
    } else {
        return undefined;
    }
}

module.exports.$gt = $gt;

function $lt(value, comp) {
    if ((_.isNumber(value) && _.isNumber(comp)) || (_.isString(value) && _.isString(comp))) {
        return value < comp;
    } else {
        return undefined;
    }
}

module.exports.$lt = $lt;

function $eq(value, comp) {
    return _.isEqual(value, comp);
}

module.exports.$eq = $eq;

function $ne(value, comp) {
    return !_.isEqual(value, comp);
}

module.exports.$ne = $ne;

function $in(value, array) {
    if (_.isArray(array) || _.isString(array)) {
        return _.indexOf(array, value) > -1 ? true : false;
    } else {
        return undefined;
    }
}

module.exports.$in = $in;

function $regex(value, regex) {
    if (_.isRegExp(regex)) {
        return value.match(regex) ? true : false;
    } else {
        return undefined;
    }
}

module.exports.$regex = $regex;

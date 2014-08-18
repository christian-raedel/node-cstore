[![Build Status](https://travis-ci.org/christian-raedel/node-cstore.svg?branch=master)](https://travis-ci.org/christian-raedel/node-cstore)

# CStore #

A [node.js](http://nodejs.org) document store with the ability to load from and save to a file,
record collection changes in a swapfile and last, but not least, perform basic CRUD operations
on collections.

## Installation ##

```
npm install --save git+https://github.com/christian-raedel/node-cstore.git
```

### Testing ###

```
cd /path/to/node-cstore
make install test
```

### Documentation ###

```
cd /path/to/node-cstore
make install docs
$BROWSER doc/index.html
```
or [browse
online](http://christian-raedel.github.io/node-cstore/index.html)

## Basic Usage ##

``` Javascript
var cstore = require('node-cstore');

var ds = new cstore.CStore({name: '$appleStore'})
.addModel(new cstore.CModel({name: '$macBooks'}));

ds.getModel('$macBooks')
.insert({
    name: 'Mac Book Pro', description: 'Some appraisals', price: 2700
})
.insert({
    name: 'Mac Book Air', description: 'Some more appraisals', price: 1800
});

var model = ds.getModel('$macBooks')
    , docs1 = model.find({price: 2700})
    , docs2 = model.find({price: {'$gt': 1700}})
    , docs25= model.find({price: {'$gt': 1700}, description: {'$in': 'appraisals'}})
    , docs3 = model.find({'$or': {price: {'$eq': 2700}, price: {'$eq': 1800}}});

model.update({price: 2700}, {description: 'extra vaganza'});

model.delete({price: 1800});
```

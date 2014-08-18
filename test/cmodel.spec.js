var _ = require('lodash')
    , chai = require('chai')
    , expect = require('chai').expect
    , spies = require('chai-spies')
    , ops = require('../lib/find-ops')
    , CModel = require('../lib/cmodel');

chai.use(spies);

describe('CModel', function() {
    it('should instanciates', function() {
        expect(new CModel()).to.be.an.instanceof(CModel);
    });

    it('should insert new data', function() {
        var model = new CModel();

        function oninsert(data) {
            expect(data['_id']).to.be.ok;
            expect(data.name).to.be.equal('inge');
        }
        var spy = chai.spy(oninsert);
        model.on('insert', spy);
        model.insert({name: 'inge'});
        expect(spy).to.have.been.called.once;
    });

    it('should find an object by id', function() {
        var model = new CModel();

        var id = model.insert({name: 'inge'})['_id'];
        expect(id).to.be.a('string');
        expect(model.findById(id)).to.be.deep.equal({name: 'inge', _id: id});
        expect(model.findById('test')).to.be.not.ok;
    });
});

describe('FindOps', function() {
    it('$gt', function() {
        expect(ops.$gt(1, 2)).to.be.false;
        expect(ops.$gt(2, 1)).to.be.true;
        expect(ops.$gt('$inge', '$noir')).to.be.false;
        expect(ops.$gt('$inge', '$amour')).to.be.true;
        expect(ops.$gt({a: 1}, {b: 2})).to.be.undefined;
    });

    it('$lt', function() {
        expect(ops.$lt(1, 2)).to.be.true;
        expect(ops.$lt(2, 1)).to.be.false;
        expect(ops.$lt('$inge', '$noir')).to.be.true;
        expect(ops.$lt('$inge', '$amour')).to.be.false;
        expect(ops.$lt({a: 1}, {b: 2})).to.be.undefined;
    });

    it('$eq', function() {
        expect(ops.$eq(1, 1)).to.be.true;
        expect(ops.$eq(2, 1)).to.be.false;
        expect(ops.$eq('$inge', '$inge')).to.be.true;
        expect(ops.$eq('$inge', '$amour')).to.be.false;
        expect(ops.$eq({a: 1}, {b: 2})).to.be.false;
        expect(ops.$eq({b: 2}, {b: 2})).to.be.true;
    });

    it('$ne', function() {
        expect(ops.$ne(1, 1)).to.be.false;
        expect(ops.$ne(2, 1)).to.be.true;
        expect(ops.$ne('$inge', '$inge')).to.be.false;
        expect(ops.$ne('$inge', '$amour')).to.be.true;
        expect(ops.$ne({a: 1}, {b: 2})).to.be.true;
        expect(ops.$ne({b: 2}, {b: 2})).to.be.false;
    });

    it('$in', function() {
        expect(ops.$in(1, [1, 2])).to.be.true;
        expect(ops.$in(3, [1, 2])).to.be.false;
        expect(ops.$in(2, 7)).to.be.undefined;
    });
});

describe('CModel:find', function() {
    var model = null, data = null;

    beforeEach(function() {
        model = new CModel({name: '$inge'});
        data = [
            model.insert({dress: '$noir', size: 27, material: 'silk'}),
            model.insert({dress: '$amour', size: 27, material: 'air'}),
            model.insert({dress: '$work', size: 32, material: 'cord'})
        ];
    });

    afterEach(function() {
        model = null; data = null;
    });

    it('should find an item by a single property', function() {
        var items = model.find({dress: '$noir'});
        expect(items).to.be.deep.equal(data.slice(0, 1));
    });

    it('should find items by a single property', function() {
        var items = model.find({size: 27});
        expect(items).to.be.deep.equal(data.slice(0, 2));
    });

    it('should find an item by multiple properties', function() {
        var items = model.find({size: 27, material: 'air'});
        expect(items).to.be.deep.equal(data.slice(1, 2));
    });

    it('should find an item by a single query', function() {
        var items = model.find({dress: {'$eq': '$noir'}});
        expect(items).to.be.deep.equal(data.slice(0, 1));
    });

    it('should find items by a single query', function() {
        var items = model.find({size: {'$eq': 27}});
        expect(items).to.be.deep.equal(data.slice(0, 2));
    });

    it('should find an item by multiple queries', function() {
        var items = model.find({size: {'$eq': 27}, material: {'$eq': 'air'}});
        expect(items).to.be.deep.equal(data.slice(1, 2));
    });

    it('should find items by an $or query', function() {
        var items = model.find({'$or': {size: {'$eq': 27}, size: {'$eq': 32}}});
        expect(items).to.be.deep.equal(data);
    });
});

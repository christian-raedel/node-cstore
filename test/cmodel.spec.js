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
        /* jshint -W075 */
        var items = model.find({'$or': {size: {'$eq': 27}, size: {'$eq': 32}}});
        expect(items).to.be.deep.equal(data);
    });
});

describe('CModel.update', function() {
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

    it('should update an item by a single property', function() {
        var items = model.update({dress: '$noir'}, {dress: '$amour'});
        expect(items.length).to.be.equal(1);
        expect(items[0]['_id']).to.be.equal(data[0]['_id']);
        expect(items[0].dress).to.be.equal('$amour');
        expect(items[0].size).to.be.equal(27);
        expect(items[0].material).to.be.equal('silk');
        expect(model.data.slice(0, 1)).to.be.deep.equal(items);
    });

    it('should update multiple items by a query', function() {
        var items = model.update({size: {'$eq': 27}}, {material: 'air'});
        expect(items.length).to.be.equal(2);
        expect(items[0].material).to.be.equal('air');
        expect(items[1].material).to.be.equal('air');
    });

    it('should emit event on update', function() {
        function onupdate(updated) {
            expect(updated.length).to.be.equal(2);
            expect(updated[0].size).to.be.equal(32);
            expect(updated[1].size).to.be.equal(32);
        }
        var spy = chai.spy(onupdate);
        model.on('update', spy);

        model.update({size: 27}, {size: 32});
        expect(spy).to.have.been.called.once;
    });
});

describe('CModel.delete', function() {
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

    it('should delete an item by a single property', function() {
        var items = model.delete({dress: '$noir'});
        expect(items).to.be.deep.equal(data.slice(0, 1));
        expect(model.data).to.be.deep.equal(data.slice(1, 3));
    });

    it('should delete multiple items by a query', function() {
        var items = model.delete({'$or': {size: {'$eq': 27}, material: {'$eq': 'chord'}}});
        expect(items).to.be.deep.equal(data);
        expect(model.data).to.be.deep.equal([]);
    });

    it('should emit event on delete', function() {
        function ondelete(deleted) {
            expect(deleted.length).to.be.equal(2);
            expect(deleted[0].size).to.be.equal(27);
            expect(deleted[1].size).to.be.equal(27);
        }
        var spy = chai.spy(ondelete);
        model.on('delete', spy);

        model.delete({size: 27});
        expect(spy).to.have.been.called.once;
    });
});

var _ = require('lodash')
    , chai = require('chai')
    , expect = require('chai').expect
    , spies = require('chai-spies')
    , promised = require('chai-as-promised')
    , q = require('q')
    , ops = require('../index').findOps
    , CQModel = require('../index').CQModel;

chai.use(spies).use(promised);

describe('CQModel', function() {
    it('should instanciates', function() {
        expect(new CQModel()).to.be.an.instanceof(CQModel);
    });

    it('should insert new data', function() {
        var model = new CQModel();

        function oninsert(data) {
            expect(data['_id']).to.be.a('string');
            expect(data.name).to.be.equal('inge');
        }
        var spy = chai.spy(oninsert);
        model.on('insert', spy);
        expect(model.insert({name: 'inge'})).to.eventually.have.property('name', 'inge');
    });

    it('should find an object by id', function() {
        var model = new CQModel();

        model.insert({name: 'inge'}).then(function(doc) {
            expect(model.findById(doc['_id'])).to.eventually.have.property('name', 'inge');
        });
        expect(model.findById('test')).to.eventually.not.ok;
    });
});

describe('CQModel:find', function() {
    var model = null, data = null;

    beforeEach(function(done) {
        model = new CQModel({name: '$inge'});

        q.all([
            model.insert({dress: '$noir', size: 27, material: 'silk'}),
            model.insert({dress: '$amour', size: 27, material: 'air'}),
            model.insert({dress: '$work', size: 32, material: 'cord'})
        ])
        .then(function(result) {
            data = result;
            done();
        })
        .catch(done);
    });

    afterEach(function() {
        model = null; data = null;
    });

    it('should find an item by a single property', function() {
        expect(model.find({dress: '$noir'})).to.become(data.slice(0, 1));
    });

    it('should throw an error on invalid arguments', function() {
        expect(model.find('_id2')).to.be.rejectedWith(TypeError);
    });
});

describe('CQModel:update', function() {
    var model = null, data = null;

    beforeEach(function(done) {
        model = new CQModel({name: '$inge'});

        q.all([
            model.insert({dress: '$noir', size: 27, material: 'silk'}),
            model.insert({dress: '$amour', size: 27, material: 'air'}),
            model.insert({dress: '$work', size: 32, material: 'cord'})
        ])
        .then(function(result) {
            data = result;
            done();
        })
        .catch(done);
    });

    afterEach(function() {
        model = null; data = null;
    });

    it('should update multiple items by a query', function() {
        var expected = data;
        data[0].material = 'air';
        data[1].material = 'air';
        expect(model.update({size: {'$eq': 27}}, {material: 'air'})).to.become(expected);
    });

    it('should update item by id', function() {
        expect(model.updateById(data[0]['_id'], {material: 'air'})).to.eventually.have.property('material', 'air');
    });
});

describe('CQModel:delete', function() {
    var model = null, data = null;

    beforeEach(function(done) {
        model = new CQModel({name: '$inge'});

        q.all([
            model.insert({dress: '$noir', size: 27, material: 'silk'}),
            model.insert({dress: '$amour', size: 27, material: 'air'}),
            model.insert({dress: '$work', size: 32, material: 'cord'})
        ])
        .then(function(result) {
            data = result;
            done();
        })
        .catch(done);
    });

    afterEach(function() {
        model = null; data = null;
    });

    it('should delete multiple items by a query', function() {
        expect(model.delete({'$or': {size: {'$eq': 27}, material: {'$eq': 'chord'}}})).to.become(data);
    });

    it('should delete an item by an id', function() {
        expect(model.deleteById(data[0]['_id'])).to.become(data[0]);
    });
});

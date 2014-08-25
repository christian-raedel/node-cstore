var _ = require('lodash')
    , chai = require('chai')
    , expect = require('chai').expect
    , spies = require('chai-spies')
    , promised = require('chai-as-promised')
    , fs = require('fs')
    , CQModel = require('../index').CQModel
    , CSModel = require('../index').CSModel
    , CQStore = require('../index').CQStore;

chai.use(spies).use(promised);

describe('CQStore', function() {
    it('should instanciates', function() {
        expect(new CQStore()).to.be.an.instanceof(CQStore);
    });

    it('should add a model', function(done) {
        var datastore = new CQStore();
        datastore.addModel(new CQModel({name: '$inge'})).then(function(datastore) {
            expect(datastore).to.be.an.instanceof(CQStore);
            expect(datastore.models['$inge']).to.be.an.instanceof(CQModel);
            done();
        }).catch(done);
    });

    it('should get a model by name', function(done) {
        var datastore = new CQStore();
        datastore.addModel(new CQModel({name: '$inge'})).then(function(datastore) {
            datastore.getModel('$inge').then(function(model) {
                expect(model.config.getValue('name')).to.be.equal('$inge');
                done();
            });
        });
    });
});

describe('CQStore:load&save', function() {
    var filename = __dirname + '/test.db'
        , datastore = null;

    beforeEach(function(done) {
        datastore = new CQStore({filename: filename});
        datastore.addModel(new CQModel({name: '$inge'})).then(function(datastore) {
            expect(datastore.models['$inge'].insert({dress: '$noir'})).to.be.fulfilled;
            expect(datastore.models['$inge'].insert({dress: '$amour'})).to.be.fulfilled;
            done();
        });
    });

    it('should commit datastore', function(done) {
        expect(datastore.commit()).to.eventually.be.an.instanceof(CQStore);

        setTimeout(function() {
            fs.unlinkSync(filename.concat('.swp'));
            expect(fs.existsSync(filename.concat('.swp'))).to.be.false;
            done();
        }, 500);
    });

    it('should load and save', function(done) {
        expect(datastore.commit()).to.eventually.be.an.instanceof(CQStore);
        expect(datastore.save()).to.eventually.be.an.instanceof(CQStore);
        setTimeout(function() {
            expect(fs.existsSync(filename)).to.be.true;
            done();
        }, 500);
    });

    it('should load from file', function(done) {
        datastore.load().then(function(datastore) {
            expect(datastore).to.be.an.instanceof(CQStore);
            expect(datastore.models['$inge'].find({dress: '$noir'})).to.eventually.have.property('dress', '$noir');

            setTimeout(function() {
                fs.unlinkSync(filename);
                fs.unlinkSync(filename.concat('.swp'));
                done();
            }, 500);
        }).catch(done);
    });
});

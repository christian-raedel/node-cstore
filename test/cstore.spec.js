var _ = require('lodash')
    , chai = require('chai')
    , expect = require('chai').expect
    , spies = require('chai-spies')
    , fs = require('fs')
    , CStore = require('../index')
    , CSModel = CStore.CSModel
    , CQModel = CStore.CQModel;

chai.use(spies);

describe('CStore', function() {
    it('should instanciates', function() {
        var store = new CStore();
        expect(store).to.be.an.instanceof(CStore);
        expect(store.classname).to.be.equal('CStore');
        expect(store.toString()).to.be.equal('CStore [cstore]');
    });

    it('should add a model', function() {
        var datastore = new CStore().addModel(new CSModel({name: '$inge'}));
        expect(datastore).to.be.an.instanceof(CStore);
        expect(datastore.models['$inge']).to.be.an.instanceof(CSModel);
    });

    it('should throw an error on adding invalid model class', function(done) {
        var datastore = new CStore();
        //expect(datastore.addModel.bind(datastore, new CQModel())).to.throw(/.*cstore.*CQModel/);
        try {
            datastore.addModel(new CQModel());
        } catch (err) {
            expect(err).to.be.an.instanceof(TypeError);
            done();
        }
    });

    it('should create a write-stream', function(done) {
        var filename = __dirname + '/test.db'
            , datastore = new CStore({filename: filename}).addModel(new CSModel({name: '$inge'}));
        expect(datastore.stream).to.be.ok;
        expect(datastore['_logger']).to.be.ok;
        datastore.models['$inge'].insert({dress: '$noir'});
        datastore.models['$inge'].insert({dress: '$amour'});

        var swapfile = filename.concat('.swp');
        expect(fs.statSync(swapfile).isFile()).to.be.true;
        fs.unlinkSync(swapfile);

        setTimeout(function() {
            done();
        }, 500);
    });

    it('should commit datastore', function(done) {
        var filename = __dirname + '/test.db'
            , datastore = new CStore({filename: filename}).addModel(new CSModel({name: '$inge'}));

        var data = [
            datastore.models['$inge'].insert({dress: '$noir'}),
            datastore.models['$inge'].insert({dress: '$amour'})
        ];
        expect(datastore.commit()).to.be.an.instanceof(CStore);

        setTimeout(function() {
            fs.unlinkSync(filename.concat('.swp'));
            expect(fs.existsSync(filename.concat('.swp'))).to.be.false;
            expect(datastore.models['$inge'].data).to.be.deep.equal(data);
            done();
        }, 500);
    });

    it('should load and save', function(done) {
        var filename = __dirname + '/test.db'
            , datastore = new CStore({filename: filename}).addModel(new CSModel({name: '$inge'}));

        var data = [
            datastore.models['$inge'].insert({dress: '$noir'}),
            datastore.models['$inge'].insert({dress: '$amour'})
        ];
        expect(datastore.commit().save()).to.be.an.instanceof(CStore);
        expect(fs.existsSync(filename)).to.be.true;
        datastore = new CStore({filename: filename}).load();
        expect(datastore).to.be.an.instanceof(CStore);
        expect(datastore.models['$inge'].data).to.be.deep.equal(data);

        setTimeout(function() {
            fs.unlinkSync(filename);
            fs.unlinkSync(filename.concat('.swp'));
            done();
        }, 500);
    });

    it('should get a model by name', function() {
        var datastore = new CStore().addModel(new CSModel({name: '$inge'}))
            , model = datastore.getModel('$inge');
        expect(model.config.getValue('name')).to.be.equal('$inge');
    });
});

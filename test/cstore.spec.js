var _ = require('lodash')
    , chai = require('chai')
    , expect = require('chai').expect
    , spies = require('chai-spies')
    , fs = require('fs')
    , CModel = require('../lib/cmodel')
    , CStore = require('../lib/cstore');

chai.use(spies);

describe('CStore', function() {
    this.timeout(3000);

    it('should instanciates', function() {
        expect(new CStore()).to.be.an.instanceof(CStore);
    });

    it('should add a model', function() {
        var datastore = new CStore().addModel(new CModel({name: '$inge'}));
        expect(datastore).to.be.an.instanceof(CStore);
        expect(datastore.models['$inge']).to.be.an.instanceof(CModel);
    });

    it('should create a write-stream', function(done) {
        var filename = __dirname + '/test.db'
            , datastore = new CStore({filename: filename}).addModel(new CModel({name: '$inge'}));
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
            , datastore = new CStore({filename: filename}).addModel(new CModel({name: '$inge'}));

        var data = [
            datastore.models['$inge'].insert({dress: '$noir'}),
            datastore.models['$inge'].insert({dress: '$amour'})
        ];
        expect(datastore.commit()).to.be.an.instanceof(CStore);

        setTimeout(function() {
            expect(fs.existsSync(filename.concat('.swp'))).to.be.false;
            expect(datastore.models['$inge'].data).to.be.deep.equal(data);
            done();
        }, 500);
    });

    it('should load and save', function(done) {
        var filename = __dirname + '/test.db'
            , datastore = new CStore({filename: filename}).addModel(new CModel({name: '$inge'}));

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
            done();
        }, 500);
    });
});

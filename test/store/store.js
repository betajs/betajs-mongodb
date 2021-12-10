
const common = require(__dirname + "/../common");
const errorCallback = common.errorCallback;

describe("Test Database Methods", () => {
	it("should mongo database store default id", (done) => {
		var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
		var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests");
		store.insert({x: 5}).success(function(object) {
			object.should.have.property("_id");
			object.should.have.property("x").equals(5);
			store.update(object._id, {
				y: 7
			}).success(function(row) {
				row.should.have.property("y").equals(7);
				store.get(object._id).success(function(obj) {
					row.should.have.property("y").equals(7);
					store.remove(object._id).success(function() {
						store.get(object._id).success(function(result) {
							common.assert(result === null);
							mongodb.destroy();
							done();
						});
					});
				});
			});
		});
	});
	it("should mongo database store other id, separate ids", (done) => {
		var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
		//ID workaround to prevent modifying BetaJS Data
		var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests", "id", true, {_primary_key: "id"});
		store.insert({x: 5, id: 1234}).success(function(object) {
			object.should.have.property("id").equals(1234);
			object.should.have.property("x").equals(5);
			store.update(object.id, {
				y: 7
			}).success(function(row) {
				row.should.have.property("y").equals(7);
				store.get(object.id).success(function(obj) {
					obj.should.have.property("y").equals(7);
					store.remove(object.id).success(function() {
						store.query().success(function(result) {
							common.assert(result.hasNext() === false);
							mongodb.destroy();
							done();
						});
					});
				});
			});
		}).mapError(function(err) {
			return errorCallback(done, err);
		});
	});
});
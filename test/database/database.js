const common = require(__dirname + "/../common");
const errorCallback = common.errorCallback;

describe("Test Database Methods", () => {
	it("should test database object methods", (done) => {
		var db = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
		db.getTable("tests").insertRow({x: 5}).success(function(object) {
			object.should.have.property("_id");
			object.should.have.property("x").equals(5);
			db.getTable("tests").count({x: 5}).success(function(count) {
				count.should.equal(1);
				db.getTable("tests").updateById(object._id, {y: 6}).success(function() {
					db.getTable("tests").findById(object._id).success(function(result) {
						result.should.have.property("x").equals(5);
						result.should.have.property("y").equals(6);
						db.getTable("tests").removeById(object._id).success(function() {
							db.getTable("tests").findById(object._id).success(function(result) {
								common.assert(result === null);
								db.destroy();
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
});
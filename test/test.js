function importTest(name, path) {
	describe(name, function() {
		require(path);
	});
}

const common = require("./common");
describe("Tests", function() {
	importTest("Database Tests", "./database/database");
	importTest("Store Tests", "./store/store");

	after(function(done) {
		var db = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
		db.mongodb().success(async function(db) {
			try {
				await db.collection("tests").drop();
			} catch (error) { //silently fail because we don't care...
			}
			done();
		});
	});
});
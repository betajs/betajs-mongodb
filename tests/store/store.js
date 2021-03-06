QUnit.test("mongo database store default id", function(assert) {
	var done = assert.async();
	var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
	var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests");
	store.insert({x: 5}).success(function(object) {
		assert.ok(!!object._id);
		assert.equal(typeof object._id, "string");
		assert.equal(object.x, 5);
		store.update(object._id, {
			y: 7
		}).success(function(row) {
			assert.equal(row.y, 7);
			store.get(object._id).success(function(obj) {
				assert.equal(obj.y, 7);
				store.remove(object._id).success(function() {
					store.get(object._id).success(function(result) {
						assert.equal(result, null);
						mongodb.destroy();
						done();
					});
				});
			});
		});
	});
});

QUnit.test("mongo database store other id, separate ids", function(assert) {
	var done = assert.async();
	var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
	var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests", "id", true);
	store.insert({x: 5, id: 1234}).success(function(object) {
		assert.equal(object.id, 1234);
		assert.equal(object.x, 5);
		store.update(object.id, {
			y: 7
		}).success(function(row) {
			assert.equal(row.y, 7);
			store.get(object.id).success(function(obj) {
				assert.equal(obj.y, 7);
				store.remove(object.id).success(function() {
					store.get(object.id).success(function(result) {
						assert.equal(result, null);
						mongodb.destroy();
						done();
					});
				});
			});
		});
	});
});

QUnit.test("mongo database store other id, map", function(assert) {
	var done = assert.async();
	var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
	var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests", "id");
	store.insert({x: 5}).success(function(object) {
		assert.ok(!!object.id);
		assert.equal(object.x, 5);
		store.update(object.id, {
			y: 7
		}).success(function(row) {
			assert.equal(row.y, 7);
			store.get(object.id).success(function(obj) {
				assert.equal(obj.y, 7);
				store.remove(object.id).success(function() {
					store.get(object.id).success(function(result) {
						assert.equal(result, null);
						mongodb.destroy();
						done();
					});
				});
			});
		});
	});
});

QUnit.test("mongo database null property", function(assert) {
	var done = assert.async();
	var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
	var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests");
	store.insert({x: null}).success(function(object) {
		assert.ok(!!object._id);
		assert.equal(typeof object._id, "string");
		assert.equal(object.x, null);
		store.update(object._id, {
			x: 7
		}).success(function(row) {
			assert.equal(row.x, 7);
			store.get(object._id).success(function(obj) {
				assert.equal(obj.x, 7);
				store.remove(object._id).success(function() {
					store.get(object._id).success(function(result) {
						assert.equal(result, null);
						mongodb.destroy();
						done();
					});
				});
			});
		});
	});
});

QUnit.test("mongo database store $inc and $rename property", function(assert) {
	var done = assert.async();
	var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
	var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests");
	store.insert({x: 5}).success(function(object) {
		assert.ok(!!object._id);
		assert.equal(typeof object._id, "string");
		assert.equal(object.x, 5);
		store.update(object._id, {
			"$inc": {x: 1}
		}).success(function(row) {
			store.get(object._id).success(function(result) {
				assert.equal(result.x, 6);
				store.update(object._id, {
					"$rename": {x: "y"}
				}).success(function(row) {
					store.get(object._id).success(function(result) {
						assert.equal(result.y, 6);
						mongodb.destroy();
						done();
					});
				});
			});
		}).error(function(err) {
			console.log(err);
			done();
		});
	});
});
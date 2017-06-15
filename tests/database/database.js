test("mongo database store", function () {
	/* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */
	var PromiseBackup = global.Promise;
	delete global.Promise;
	/* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */

	var db = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
	db.getTable("tests").insertRow({x: 5}).success(function (object) {
		ok(!!object._id);
		QUnit.equal(typeof object._id, "string");
		QUnit.equal(object.x, 5);
		db.getTable("tests").updateById(object._id, {y: 6}).success(function () {
			db.getTable("tests").findById(object._id).success(function (result) {
				QUnit.equal(result.x, 5);
                QUnit.equal(result.y, 6);
                db.getTable("tests").removeById(object._id).success(function () {
                    db.getTable("tests").findById(object._id).success(function (result) {
                    	QUnit.equal(result, null);
                        start();
						/* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */
                        global.Promise = PromiseBackup;
						/* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */
                    });
				});
			});
		});
	});
	stop();
});
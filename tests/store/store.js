test("mongo database store default id", function () {
	/* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */
	var PromiseBackup = global.Promise;
	delete global.Promise;
	/* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */

	var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
	var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests");
	store.insert({x: 5}).success(function (object) {
		ok(!!object._id);
		QUnit.equal(typeof object._id, "string");
		QUnit.equal(object.x, 5);
		store.update(object._id, {
			y: 7
		}).success(function (row) {
			QUnit.equal(row.y, 7);
			store.get(object._id).success(function (obj) {
                QUnit.equal(obj.y, 7);
                store.remove(object._id).success(function () {
                    store.get(object._id).success(function (result) {
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


test("mongo database store other id, separate ids", function () {
    /* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */
    var PromiseBackup = global.Promise;
    delete global.Promise;
    /* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */

    var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
    var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests", "id", true);
    store.insert({x: 5, id: 1234}).success(function (object) {
        QUnit.equal(object.id, 1234);
        QUnit.equal(object.x, 5);
        store.update(object.id, {
            y: 7
        }).success(function (row) {
            QUnit.equal(row.y, 7);
            store.get(object.id).success(function (obj) {
                QUnit.equal(obj.y, 7);
                store.remove(object.id).success(function () {
                    store.get(object.id).success(function (result) {
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


test("mongo database store other id, map", function () {
    /* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */
    var PromiseBackup = global.Promise;
    delete global.Promise;
    /* QUnit Global Promise Polyfill doesn't like MongoDB Global Promise Polyfill. Ugh. */

    var mongodb = new BetaJS.Data.Databases.Mongo.MongoDatabase("mongodb://localhost/betajsmongodb");
    var store = new BetaJS.Data.Stores.DatabaseStore(mongodb, "tests", "id");
    store.insert({x: 5}).success(function (object) {
        ok(!!object.id);
        QUnit.equal(object.x, 5);
        store.update(object.id, {
            y: 7
        }).success(function (row) {
            QUnit.equal(row.y, 7);
            store.get(object.id).success(function (obj) {
                QUnit.equal(obj.y, 7);
                store.remove(object.id).success(function () {
                    store.get(object.id).success(function (result) {
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
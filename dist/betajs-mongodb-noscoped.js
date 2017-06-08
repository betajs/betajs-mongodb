/*!
betajs-mongodb - v1.0.0 - 2017-06-08
Copyright (c) Oliver Friedmann
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.Mongo');
Scoped.binding('base', 'global:BetaJS');
Scoped.binding('data', 'global:BetaJS.Data');
Scoped.define("module:", function () {
	return {
    "guid": "1f507e0c-602b-4372-b067-4e19442f28f4",
    "version": "1.0.0"
};
});
Scoped.assumeVersion('base:version', '~1.0.96');
Scoped.assumeVersion('data:version', '~1.0.41');
Scoped.define("module:Databases.MongoDatabaseTable", [
    "data:Databases.DatabaseTable",
    "base:Promise",
    "base:Objs",
    "base:Types",
    "base:Iterators.ArrayIterator"
], function(DatabaseTable, Promise, Objs, Types, ArrayIterator, scoped) {
    return DatabaseTable.extend({
        scoped: scoped
    }, {

        table: function() {
            if (this.__table)
                return Promise.create(this.__table);
            return this._database.mongodb().mapSuccess(function(db) {
                this.__table = db.collection(this._table_name);
                return this.__table;
            }, this);
        },

        primary_key: function() {
            return "_id";
        },

        _encode: function(data) {
            if (data._id && !Types.is_object(data._id)) {
                data = Objs.clone(data, 1);
                var objid = this._database.mongo_object_id();
                data._id = new objid(data._id + "");
            }
            return data;
        },

        _decode: function(data) {
            if (data._id && Types.is_object(data._id)) {
                data = Objs.clone(data, 1);
                data._id = data._id + "";
            }
            return data;
        },

        _find: function(query, options) {
            return this.table().mapSuccess(function(table) {
                return Promise.funcCallback(table, table.find, query).mapSuccess(function(result) {
                    options = options || {};
                    if ("sort" in options)
                        result = result.sort(options.sort);
                    if ("skip" in options)
                        result = result.skip(options.skip);
                    if ("limit" in options)
                        result = result.limit(options.limit);
                    return Promise.funcCallback(result, result.toArray).mapSuccess(function(cols) {
                        return new ArrayIterator(cols);
                    }, this);
                }, this);
            }, this);
        },

        _count: function(query) {
            return this.table().mapSuccess(function(table) {
                return Promise.funcCallback(table, table.find, query).mapSuccess(function(result) {
                    return Promise.funcCallback(result, result.count);
                });
            });
        },

        _insertRow: function(row) {
            return this.table().mapSuccess(function(table) {
                return Promise.funcCallback(table, table.insert, row).mapSuccess(function(result) {
                    return row;
                }, this);
            }, this);
        },

        _removeRow: function(query, callbacks) {
            return this.table().mapSuccess(function(table) {
                return Promise.funcCallback(table, table.remove, query);
            }, this);
        },

        _updateRow: function(query, row, callbacks) {
            return this.table().mapSuccess(function(table) {
                return Promise.funcCallback(table, table.update, query, {
                    "$set": row
                }).mapSuccess(function() {
                    return row;
                });
            }, this);
        },

        ensureIndex: function(key) {
            var obj = {};
            obj[key] = 1;
            this.table().success(function(table) {
                table.ensureIndex(Objs.objectBy(key, 1));
            });
        }

    });
});
Scoped.define("module:Databases.MongoDatabase", [
    "data:Databases.Database",
    "module:Databases.MongoDatabaseTable",
    "base:Strings",
    "base:Types",
    "base:Objs",
    "base:Promise",
    "base:Net.Uri"
], function(Database, MongoDatabaseTable, Strings, Types, Objs, Promise, Uri, scoped) {
    return Database.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(db) {
                if (Types.is_string(db)) {
                    this.__dbUri = Strings.strip_start(db, "mongodb://");
                    this.__dbObject = this.cls.uriToObject(db);
                } else {
                    db = Objs.extend({
                        database: "database",
                        server: "localhost",
                        port: 27017
                    }, db);
                    this.__dbObject = db;
                    this.__dbUri = this.cls.objectToUri(db);
                }
                inherited.constructor.call(this);
                this.mongo_module = require("mongodb");
            },

            _tableClass: function() {
                return MongoDatabaseTable;
            },

            mongo_object_id: function(id) {
                return this.mongo_module.ObjectID;
            },

            mongodb: function() {
                if (this.__mongodb)
                    return Promise.value(this.__mongodb);
                var promise = Promise.create();
                this.mongo_module.MongoClient.connect('mongodb://' + this.__dbUri, {
                    server: {
                        'auto_reconnect': true
                    }
                }, promise.asyncCallbackFunc());
                return promise.success(function(db) {
                    this.__mongodb = db;
                }, this);
            }
        };

    }, {

        uriToObject: function(uri) {
            var parsed = Uri.parse(uri);
            return {
                database: Strings.strip_start(parsed.path, "/"),
                server: parsed.host,
                port: parsed.port,
                username: parsed.user,
                password: parsed.password
            };
        },

        objectToUri: function(object) {
            object.path = object.database;
            return Uri.build(object);
        }

    });
});
}).call(Scoped);
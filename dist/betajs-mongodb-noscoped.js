/*!
betajs-mongodb - v1.0.18 - 2020-09-28
Copyright (c) Oliver Friedmann,Pablo Iglesias
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.Data.Databases.Mongo');
Scoped.binding('base', 'global:BetaJS');
Scoped.binding('data', 'global:BetaJS.Data');
Scoped.define("module:", function () {
	return {
    "guid": "1f507e0c-602b-4372-b067-4e19442f28f4",
    "version": "1.0.18",
    "datetime": 1601328825525
};
});
Scoped.assumeVersion('base:version', '~1.0.96');
Scoped.assumeVersion('data:version', '~1.0.41');
Scoped.define("module:MongoDatabaseTable", [
    "data:Databases.DatabaseTable",
    "base:Promise",
    "base:Objs",
    "base:Types",
    "base:Iterators.ArrayIterator"
], function(DatabaseTable, Promise, Objs, Types, ArrayIterator, scoped) {
    return DatabaseTable.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function() {
                inherited.constructor.apply(this, arguments);
                this._table_options = this._table_options || [];
                this._table_options.idkeys = this._table_options.idkeys || [];
                this._table_options.idkeys.unshift("_id");
                this._table_options.datekeys = this._table_options.datekeys || [];
            },

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

            _encode: function(data, valueType) {
                if (!data)
                    return data;
                data = Objs.map(data, function(value, k) {
                    if (value && Types.is_object(value) && !value._bsontype) {
                        this._table_options.datekeys.forEach(function(key) {
                            if (key === k)
                                valueType = "date";
                        });
                        return this._encode(value, valueType);
                    }
                    if (valueType === "date")
                        return new Date(value);
                    return value;
                }, this);
                var objid = this._database.mongo_object_id();
                this._table_options.idkeys.forEach(function(key) {
                    if (key in data && !Types.is_object(data[key]))
                        data[key] = new objid(data[key] + "");
                }, this);
                this._table_options.datekeys.forEach(function(key) {
                    if (key in data && !Types.is_object(data[key]))
                        data[key] = new Date(data[key]);
                }, this);
                return data;
            },

            _decode: function(data) {
                data = Objs.clone(data, 1);
                this._table_options.idkeys.forEach(function(key) {
                    if (key in data && Types.is_object(data[key]))
                        data[key] = data[key] + "";
                }, this);
                this._table_options.datekeys.forEach(function(key) {
                    if (key in data && Types.is_object(data[key]))
                        data[key] = data[key].getTime();
                }, this);
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
                        if ("limit" in options && Types.isNumber(options.limit))
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
                    return Promise.funcCallback(table, table.insertOne, row, this._database._options).mapSuccess(function(result) {
                        return row;
                    }, this);
                }, this);
            },

            _insertRows: function(rows) {
                return this.table().mapSuccess(function(table) {
                    return Promise.funcCallback(table, table.insertMany, rows).mapSuccess(function(result) {
                        return row;
                    }, this);
                }, this);
            },

            _removeRow: function(query) {
                return this.table().mapSuccess(function(table) {
                    return Promise.funcCallback(table, table.deleteOne, query);
                }, this);
            },

            _removeRows: function(query) {
                return this.table().mapSuccess(function(table) {
                    return Promise.funcCallback(table, table.deleteMany, query);
                }, this);
            },

            _updateRow: function(query, row) {
                return this.table().mapSuccess(function(table) {
                    return Promise.funcCallback(table, table.updateOne, query, {
                        "$set": row
                    }).mapSuccess(function() {
                        return row;
                    });
                }, this);
            },

            updateRows: function(query, row) {
                return this.table().mapSuccess(function(table) {
                    return Promise.funcCallback(table, table.updateMany, query, {
                        "$set": row
                    });
                }, this);
            },

            ensureIndex: function(key) {
                var obj = {};
                obj[key] = 1;
                this.table().success(function(table) {
                    table.ensureIndex(Objs.objectBy(key, 1));
                });
            },

            _renameTable: function(newName) {
                return this.table().mapSuccess(function(table) {
                    return Promise.funcCallback(table, table.rename, newName);
                });
            }

        };
    });
});
Scoped.define("module:MongoDatabase", [
    "data:Databases.Database",
    "module:MongoDatabaseTable",
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

            constructor: function(dbUri, options) {
                this.__dbUri = dbUri;
                var parsed = Uri.parse(dbUri.replace(/,[^\/]+/, ""));
                this.__databaseName = Strings.strip_start(parsed.path, "/");
                this._options = options || {};
                inherited.constructor.call(this);
                this.mongo_module = require("mongodb");
                this.__mongo_promise = Promise.create();
                this.__mongo_acquired = false;
            },

            _tableClass: function() {
                return MongoDatabaseTable;
            },

            mongo_object_id: function(id) {
                return this.mongo_module.ObjectID;
            },

            generate_object_id: function(id) {
                return new this.mongo_module.ObjectID();
            },

            mongodb: function() {
                if (!this.__mongo_acquired) {
                    this.__mongo_acquired = true;
                    var promise = Promise.create();
                    var options = Objs.extend(this._options, {
                        useUnifiedTopology: true,
                        useNewUrlParser: true
                    });
                    this.mongo_module.MongoClient.connect(this.__dbUri, options, promise.asyncCallbackFunc());
                    promise.success(function(client) {
                        this.__mongodb = client.db(this.__databaseName);
                        this.__client = client;
                        this.__mongo_promise.asyncSuccess(this.__mongodb);
                    }, this);
                }
                return this.__mongo_promise;
            },

            destroy: function() {
                if (this.__client)
                    this.__client.close();
                inherited.destroy.call(this);
            }

        };

    });
});
}).call(Scoped);
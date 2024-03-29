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
                return this._table_options._primary_key || "_id";
            },

            _encode: function(data, valueType) {
                if (!data)
                    return data;
                data = Objs.map(data, function(value, k) {
                    if (value && Types.is_object(value) && !value._bsontype) {
                        if (this._table_options.datekeys.includes(k)) {
                            valueType = "date";
                        }
                        value = this._encode(value, valueType);
                        valueType = null;
                    }
                    if (valueType === "date") {
                        value = new Date(value);
                        valueType = null;
                    }
                    return value;
                }, this);
                var objid = this._database.mongo_object_id();
                this._table_options.idkeys.forEach(function(key) {
                    if (key in data && !Types.is_null(data[key]) && !Types.is_object(data[key]))
                        data[key] = new objid(data[key] + "");
                }, this);
                this._table_options.datekeys.forEach(function(key) {
                    if (key in data && !Types.is_null(data[key]) && !Types.is_object(data[key]))
                        data[key] = new Date(data[key]);
                }, this);
                return data;
            },

            _decode: function(data) {
                data = Objs.clone(data, 1);
                this._table_options.idkeys.forEach(function(key) {
                    if (key in data && Types.is_object_instance(data[key]))
                        data[key] = data[key] + "";
                }, this);
                this._table_options.datekeys.forEach(function(key) {
                    if (key in data && Types.is_object_instance(data[key]))
                        data[key] = data[key].getTime();
                }, this);
                return data;
            },

            _find: function(query, options) {
                if ("limit" in options && !Types.isNumber(options.limit))
                    delete options.limit;
                return this.table().mapSuccess(function(table) {
                    if (query[this.primary_key()]) {
                        return Promise.fromNativePromise(table.findOne(query, options)).mapSuccess(function(result) {
                            return new ArrayIterator([result]);
                        }, this);
                    } else {
                        return Promise.box(table.find, table, [query, options]).mapSuccess(function(result) {
                            return Promise.fromNativePromise(result.toArray()).mapSuccess(function(cols) {
                                return new ArrayIterator(cols);
                            }, this);
                        }, this);
                    }
                }, this);
            },

            _count: function(query) {
                return this.table().mapSuccess(function(table) {
                    return Promise.fromNativePromise(table.count(query)).mapSuccess(function(result) {
                        return Promise.value(result);
                    });
                });
            },

            _insertRow: function(row) {
                return this.table().mapSuccess(function(table) {
                    return Promise.fromNativePromise(table.insertOne(row, this._database._options)).mapSuccess(function(result) {
                        return row;
                    }, this);
                }, this);
            },

            _insertRows: function(rows) {
                return this.table().mapSuccess(function(table) {
                    return Promise.fromNativePromise(table.insertMany(rows)).mapSuccess(function(result) {
                        return row;
                    }, this);
                }, this);
            },

            _removeRow: function(query) {
                return this.table().mapSuccess(function(table) {
                    return Promise.fromNativePromise(table.deleteOne(query));
                }, this);
            },

            _removeRows: function(query) {
                return this.table().mapSuccess(function(table) {
                    return Promise.fromNativePromise(table.deleteMany(query));
                }, this);
            },

            _updateRow: function(query, row) {
                return this.table().mapSuccess(function(table) {
                    var updateOp = row;
                    var keys = Objs.keys(row);
                    if (keys.length === 0 || !keys[0].startsWith("$")) {
                        updateOp = {
                            "$set": row
                        };
                    }
                    return Promise.fromNativePromise(table.updateOne(query, updateOp)).mapSuccess(function() {
                        return row;
                    }).mapError(function(err) {
                        return err;
                    });
                }, this);
            },

            updateRows: function(query, row) {
                return this.table().mapSuccess(function(table) {
                    return Promise.fromNativePromise(table.updateMany(query, {
                        "$set": row
                    }));
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
                    return Promise.fromNativePromise(table.rename(newName));
                });
            }

        };
    });
});
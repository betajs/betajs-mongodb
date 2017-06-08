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
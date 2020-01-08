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
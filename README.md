# betajs-mongodb 1.0.0
[![Code Climate](https://codeclimate.com/github/betajs/betajs-mongodb/badges/gpa.svg)](https://codeclimate.com/github/betajs/betajs-mongodb)
[![NPM](https://img.shields.io/npm/v/betajs-mongodb.svg?style=flat)](https://www.npmjs.com/package/betajs-mongodb)


BetaJS-MongoDB is a MongoDB wrapper for BetaJS.



## Getting Started


You can use the library in your NodeJS project and compile it as well.

#### NodeJS

```javascript
	var BetaJS = require('betajs');
	require('betajs-data');
	require('betajs-mongodb');
```


#### Compile

```javascript
	git clone https://github.com/betajs/betajs-mongodb.git
	npm install
	grunt
```



## Basic Usage


We provide a simple abstraction for databases and tables, with a concrete implementation for MongoDB.

First, you instantiate a database, e.g. a MongoDB:

```javascript
	var database = new BetaJS.Data.Databases.MongoDatabase("mongodb://localhost/database");
```
 
The `MongoDatabase` class inherits from the abstract `Database` class.

Once you have a `database` instance, you can access database tables / collections as follows:

```javascript
	var table = database.getTable('my-table-name');
```

A `table` instance allows you to perform the typical (asynchronous) CRUD operations on the table:

```javascript
	table.insertRow({row data}).success(function (inserted) {...}).error(function (error) {...});
	
	table.removeRow({remove query}).success(function () {...}).error(function (error) {...});
	table.removeById(id).success(function () {...}).error(function (error) {...});
	
	table.updateRow({update query}, {row data}).success(function (updated) {...}).error(function (error) {...});
	table.updateById(id, {row data}).success(function (updated) {...}).error(function (error) {...});
	
	table.find({search query}, {limit, skip, sort}).success(function (rowIterator) {...}).error(function (error) {...});
	table.findOne({search query}, {skip, sort}).success(function (row) {...}).error(function (error) {...});
	table.findById(id).success(function (row) {...}).error(function (error) {...});
``` 

In most cases, you would not access database table instances directly but through the abstraction of a store.

Database Stores allow you to access a database table through the abstract of a `Store`, providing all the additional functionality from the `BetaJS-Data` module.

Once you have instantiated your `database` instance, you can create a corresponding `Store` for a table as follows, e.g. for a MongoDB:

```javascript
	var store = new BetaJS.Data.Stores.MongoDatabaseStore(database, "my-database-table");
```


## Links
| Resource   | URL |
| :--------- | --: |
| Homepage   | [http://betajs.com](http://betajs.com) |
| Git        | [git://github.com/betajs/betajs-mongodb.git](git://github.com/betajs/betajs-mongodb.git) |
| Repository | [https://github.com/betajs/betajs-mongodb](https://github.com/betajs/betajs-mongodb) |
| Blog       | [http://blog.betajs.com](http://blog.betajs.com) | 
| Twitter    | [http://twitter.com/thebetajs](http://twitter.com/thebetajs) | 
 



## Compatability
| Target | Versions |
| :----- | -------: |
| NodeJS | 0.10 - Latest |


## CDN
| Resource | URL |
| :----- | -------: |
| betajs-sql.js | [http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql.js](http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql.js) |
| betajs-sql.min.js | [http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql.min.js](http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql.min.js) |
| betajs-sql-noscoped.js | [http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql-noscoped.js](http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql-noscoped.js) |
| betajs-sql-noscoped.min.js | [http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql-noscoped.min.js](http://cdn.rawgit.com/betajs/betajs-sql/master/dist/betajs-sql-noscoped.min.js) |



## Dependencies
| Name | URL |
| :----- | -------: |
| betajs | [Open](https://github.com/betajs/betajs) |
| betajs-data | [Open](https://github.com/betajs/betajs-data) |


## Weak Dependencies
| Name | URL |
| :----- | -------: |
| betajs-scoped | [Open](https://github.com/betajs/betajs-scoped) |


## Main Contributors

- Oliver Friedmann

## License

Apache-2.0








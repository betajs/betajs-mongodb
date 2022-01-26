require("betajs");
require("betajs-data");
require(__dirname + "/../dist/betajs-mongodb.js");

const chai = require('chai');
chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();

exports.chai = chai;
exports.assert = chai.assert;
exports.expect = chai.expect;
exports.errorCallback = (done, err) => {
		if (typeof err === "string")
			return done(new Error(err));
		const errObj = typeof err.message === "string" ? err : new Error(err.message());
		return done(errObj);
};
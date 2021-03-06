"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

require("babel/polyfill");
var _ = require("lodash");
var should = require("should");
var Promise = (global || window).Promise = require("bluebird");
var __DEV__ = process.env.NODE_ENV !== "production";
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === "object";
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
  Error.stackTraceLimit = Infinity;
}

var MQDBProxy = _interopRequire(require("../"));

var Redis = _interopRequire(require("redis"));

var Pg = _interopRequire(require("pg"));

Promise.promisifyAll(Pg.Client.prototype);

var pg = new Pg.Client("postgres://test:test@localhost/test");
var __VERSION__ = "v0_0_1";
var redisSub = Redis.createClient(6379, "localhost");
var redisPub = Redis.createClient(6379, "localhost");

var proxy = new MQDBProxy({ redisSub: redisSub, redisPub: redisPub, pg: pg }, {
  doFooBar: function doFooBar(_ref) {
    var foo = _ref.foo;
    var bar = _ref.bar;

    return Promise["try"](function () {
      // some preconditions which can be async
      foo.should.be.a.Number;
      bar.should.be.a.String;
      return ["doFooBar" + __VERSION__, [foo, bar]];
    });
  },

  doBarFoo: function doBarFoo(_ref) {
    var bar = _ref.bar;
    var foo = _ref.foo;

    return Promise["try"](function () {
      foo.should.be.exactly(bar);
      return ["doBarFoo" + __VERSION__, [bar, foo]];
    });
  } });

proxy.start().then(function () {
  console.log("MQDBProxy ready.");
  proxy.mockRedisMessage(JSON.stringify({
    action: "doFooBar",
    query: {
      foo: 42,
      bar: "fortytwo" } }));
  proxy.mockRedisMessage(JSON.stringify({
    action: "doBarFoo",
    query: {
      foo: 1337,
      bar: 1337 } }));
});
var expect = require('chai').expect;
var Util = require('../src/util');

describe('util tests', function () {
  it('should pass this canary test', function () {
    expect(true).to.eql(true)
  });

  var util;
  beforeEach(function () {
    util = new Util();
  });

  it('should pass if f2c returns 0C to 32F', function () {
    var farenhait = 32;
    var celsuis = util.f2c(farenhait);
    expect(celsuis).to.eql(0);
  })

  it('should pass if f2c returns 10C to 50F', function () {
    var farenhait = 50;
    var celsuis = util.f2c(farenhait);
    expect(celsuis).to.eql(10);
  })
});
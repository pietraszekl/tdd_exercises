var expect = require('chai').expect;
var linesCount = require('../src/files');
require('chai').use(require('chai-as-promised'));

describe('test promises', function () {
  it('should return correct lins count for a valid file', function () {
    var callback = function (count) {
      expect(count).to.be.eql(15);
    }
    return linesCount('src/files.js')
      .then(callback);
  })
  it('should return lines count - using eventually', function () {
    return expect(linesCount('src/files.js')).to.eventually.eql(15)
  })
  it('should return lines count - using no return', function (done) {
    expect(linesCount('src/files.js')).to.eventually.eql(15).notify(done)
  });
  it('should report error for an invalid file name', function (done) {
    expect(linesCount('src/flies.js')).to.be.rejected.notify(done)
  })
  it('should report error for an invalid file - using with', function (done) {
    expect(linesCount('src/flies.js')).to.be.rejectedWith('unable to open file src/flies.js').notify(done)
  })
})
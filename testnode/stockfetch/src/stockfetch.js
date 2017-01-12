var fs = require('fs');

var Stockfetch = function () {
  this.readTickersFile = function (filename, onError) {
    var self = this;
    var processResponse = function (err, data) {
      if (err) {
        onError('Error reading file: ' + filename);
      } else {
        var tickers = self.parseTickers(data.toString());
        self.processTickers(tickers);
      }
    };
    fs.readFile(filename, processResponse);
  };
  this.parseTickers = function () { };
  this.processTickers = function () { };
};

module.exports = Stockfetch;
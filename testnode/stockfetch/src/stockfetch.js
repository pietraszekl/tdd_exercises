var fs = require('fs');
var http = require('http');

var Stockfetch = function () {
  this.readTickersFile = function (filename, onError) {
    var self = this;
    var processResponse = function (err, data) {
      if (err) {
        onError('Error reading file: ' + filename);
      } else {
        var tickers = self.parseTickers(data.toString());
        if (tickers.length === 0) {
          onError('File ' + filename + ' has invalid content');
        } else {
          self.processTickers(tickers);
        }

      }
    };
    fs.readFile(filename, processResponse);
  };

  this.parseTickers = function (content) {
    var isInRightFormat = function (str) {
      return str.trim().length !== 0 && str.indexOf(' ') < 0
    };
    return content.split('\n').filter(isInRightFormat);
  };

  this.processTickers = function (tickers) {
    var self = this;
    self.tickersCount = tickers.length;
    tickers.forEach(function (ticker) {
      self.getPrice(ticker);
    });

  };
  this.tickerCount = 0;
  this.http = http;

  this.getPrice = function (symbol) {
    var url = 'http://ichart.finance.yahoo.com/table.csv?s=' + symbol;
    this.http.get(url, this.processResponse.bind(this, symbol)).on('error', this.processHttpError.bind(this, symbol));
  };

  this.processResponse = function () { }
  this.processHttpError = function () { }

};

module.exports = Stockfetch;
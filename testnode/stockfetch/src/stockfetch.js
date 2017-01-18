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

  this.processResponse = function (symbol, response) {
    var self = this;
    if (response.statusCode === 200) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        self.parsePrice(symbol, data);
      });
    } else {
      self.processError(symbol, response.statusCode)
    }
  }
  this.processHttpError = function (ticker, error) {
    this.processError(ticker, error.code);
  }

  this.parsePrice = function (ticker, data) {
    var price = data.split('\n')[1].split(',').pop();
    this.prices[ticker] = price;
    this.printReport();
  }
  this.processError = function (ticker, error) {
    this.errors[ticker] = error;
    this.printReport();
  }
  this.printReport = function () { }
  this.prices = {};
  this.errors = {};
};

module.exports = Stockfetch;
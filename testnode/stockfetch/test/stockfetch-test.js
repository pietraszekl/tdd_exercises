var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');
var http = require('http');
var Stockfetch = require('../src/stockfetch');

var data = "Date,Open,High,Low,Close,Volume,Adj Close\n\
2017-01-17,807.080017,807.140015,800.369995,804.609985,1355800,804.609985\n\
2017-01-13,807.47998,811.223999,806.690002,807.880005,1090100,807.880005";

describe('Stockfetch tests', function () {
  var stockfetch;
  var sandbox;

  beforeEach(function () {
    stockfetch = new Stockfetch();
    sandbox = sinon.sandbox.create();
  });
  afterEach(function () {
    sandbox.restore();
  });

  it('should pass this canary test', function () {
    expect(true).to.be.true;
  });

  it('read should invoke error handler for invalid file', function (done) {
    var onError = function (err) {
      expect(err).to.be.eql('Error reading file: InvalidFile');
      done();
    }
    sandbox.stub(fs, 'readFile', function (filename, callback) {
      callback(new Error('failed'));
    })
    stockfetch.readTickersFile('InvalidFile', onError);
  });

  it('read should invoke processTickers for valid file', function (done) {
    var rawData = 'GOOG\nAAPL\nORCL\nMSFT';
    var parsedData = ['GOOG', 'AAPL', 'ORCL', 'MSFT'];

    sandbox.stub(stockfetch, 'parseTickers').withArgs(rawData).returns(parsedData);

    sandbox.stub(stockfetch, 'processTickers', function (data) {
      expect(data).to.be.eql(parsedData);
      done();
    })
    sandbox.stub(fs, 'readFile', function (fileName, callback) {
      callback(null, rawData);
    });
    stockfetch.readTickersFile('tickers.tx');
  });
  it('read should return error if given file is empty', function (done) {
    var onError = function (err) {
      expect(err).to.be.eql('File tickers.txt has invalid content');
      done();
    }
    sandbox.stub(stockfetch, 'parseTickers').withArgs('').returns([]);
    sandbox.stub(fs, 'readFile', function (fileName, callback) {
      callback(null, '');
    });
    stockfetch.readTickersFile('tickers.txt', onError);
  });
  it('parseTickers should return tickers', function () {
    expect(stockfetch.parseTickers("A\nB\nC")).to.be.eql(['A', 'B', 'C']);
  });
  it('parseTickers should return empty array for empty content', function () {
    expect(stockfetch.parseTickers("")).to.be.eql([]);
  });
  it('parseTickers should return empty array for empty-sapce', function () {
    expect(stockfetch.parseTickers(" ")).to.be.eql([]);
  });
  it('parseTickers should ignore unexpected format in content', function () {
    var rawData = "AAPL   \nBla h\nGOOG\n\n   ";
    expect(stockfetch.parseTickers(rawData)).to.be.eql(['GOOG']);
  });

  it('processTickers should call getPrice for each ticker symbol', function () {
    var stockfetchMock = sandbox.mock(stockfetch);
    stockfetchMock.expects('getPrice').withArgs('A');
    stockfetchMock.expects('getPrice').withArgs('B');
    stockfetchMock.expects('getPrice').withArgs('C');

    stockfetch.processTickers(['A', 'B', 'C']);
    stockfetchMock.verify();
  });

  it('processTickers should save tickers count', function () {
    sandbox.stub(stockfetch, 'getPrice');
    stockfetch.processTickers(['A', 'B', 'C']);
    expect(stockfetch.tickersCount).to.be.eql(3);
  });

  it('getPrice should call get on http with valid URL', function (done) {
    var httpStub = sandbox.stub(stockfetch.http, 'get', function (url) {
      expect(url).to.be.eql('http://ichart.finance.yahoo.com/table.csv?s=GOOG');
      done();
      return {
        on: function () { }
      }
    });
    stockfetch.getPrice('GOOG');
  });
  it('getPrice should send a response handler to get', function (done) {
    var aHandler = function () { };
    sandbox.stub(stockfetch.processResponse, 'bind').withArgs(stockfetch, 'GOOG').returns(aHandler);

    var httpStub = sandbox.stub(stockfetch.http, 'get', function (url, handler) {
      expect(handler).to.be.eql(aHandler);
      done();
      return { on: function () { } };
    });
    stockfetch.getPrice('GOOG');
  });
  it('getPrice should register handler for failure to reach host', function (done) {
    var errorHandler = function () { };

    sandbox.stub(stockfetch.processHttpError, 'bind').withArgs(stockfetch, 'GOOG').returns(errorHandler);

    var onStub = function (event, handler) {
      expect(event).to.be.eql('error');
      expect(handler).to.be.eql(errorHandler);
      done();
    };
    sandbox.stub(stockfetch.http, 'get').returns({ on: onStub });
    stockfetch.getPrice('GOOG');
  });
  it('processResponse should call paresePrice with valid data', function () {
    var dataFunction;
    var endFunction;

    var response = {
      statusCode: 200,
      on: function (event, handler) {
        if (event === 'data') {
          dataFunction = handler;
        }
        if (event === 'end') {
          endFunction = handler;
        }
      }
    };
    var parsePriceMock = sandbox.mock(stockfetch).expects('parsePrice').withArgs('GOOG', 'some data');
    stockfetch.processResponse('GOOG', response);
    dataFunction('some ');
    dataFunction('data');
    endFunction();

    parsePriceMock.verify();
  });
  it('processResponse should call processError if response failed', function () {
    var response = {
      statusCode: 404
    };
    var processErrorMock = sandbox.mock(stockfetch).expects('processError').withArgs('GOOG', 404);

    stockfetch.processResponse('GOOG', response);
    processErrorMock.verify();
  });
  it('processResponse should call processError only if response failed', function () {
    var response = {
      statusCode: 200,
      on: function () { }
    };
    var processErrorMock = sandbox.mock(stockfetch).expects('processError').never();

    stockfetch.processResponse('GOOG', response);
    processErrorMock.verify();
  });
  it('processHttpError should call processError with error details', function () {
    var processErrorMock = sandbox.mock(stockfetch).expects('processError').withArgs('GOOG', '...error code ...');

    var error = {
      code: '...error code ...'
    };
    stockfetch.processHttpError('GOOG', error);
    processErrorMock.verify();
  });
  it('parsePrice should update prices', function () {
    stockfetch.parsePrice('GOOG', data);
    expect(stockfetch.prices.GOOG).to.be.eql('804.609985');
  });
  it('parsePrice should call printReport', function () {
    var printReportMock = sandbox.mock(stockfetch).expects('printReport');
    stockfetch.parsePrice('GOOG', data);
    printReportMock.verify();
  });
  it('processError should update errors', function () {
    stockfetch.processError('GOOG', '...oops...');
    expect(stockfetch.errors.GOOG).to.be.eql('...oops...');
  });
  it('processError should call printReport', function () {
    var printReportMock = sandbox.mock(stockfetch).expects('printReport');

    stockfetch.processError('GOOG', '...oops...');
    printReportMock.verify();
  });
  it('printReport should send price, errors once allresponse arrive', function () {
    stockfetch.prices = { 'GOOG': 12.34 };
    stockfetch.errors = { 'AAPL': 'error' };
    stockfetch.tickersCount = 2;
    var callbackMock = sandbox.mock(stockfetch).expects('reportCallback').withArgs([['GOOG', 12.34]], [['AAPL', 'error']]);
    stockfetch.printReport();
    callbackMock.verify();
  });
  it('printReport should not send before all responses arrive', function () {
    stockfetch.prices = { 'GOOG': 12.34 };
    stockfetch.errors = { 'AAPL': 'error' };
    stockfetch.tickersCount = 3;
    var callbackMock = sandbox.mock(stockfetch).expects('reportCallback').never();
    stockfetch.printReport();
    callbackMock.verify();
  });

  it('printReport should call sortData once for prices, once for errors', function () {
    stockfetch.prices = { 'GOOG': 12.34 };
    stockfetch.errors = { 'AAPL': 'error' };
    stockfetch.tickersCount = 2;
    var mock = sandbox.mock(stockfetch);
    mock.expects('sortData').withArgs(stockfetch.prices);
    mock.expects('sortData').withArgs(stockfetch.errors);
    stockfetch.printReport();
    mock.verify();
  });

  it('sortData should sort the data based on the symbols', function () {
    var dataToSort = {
      'GOOG': 1.2,
      'AAPL': 2.1
    };
    var result = stockfetch.sortData(dataToSort);
    expect(result).to.be.eql([['AAPL', 2.1], ['GOOG', 1.2]]);
  })
})
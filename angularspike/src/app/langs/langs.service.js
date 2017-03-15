(function (app) {
  app.LangsService = ng.core
    .Class({
      constructor: [ng.http.Http, function (_http) {
        this.http = _http;
      }],
      get: function () {
        return this.http.get('/languages')
          .map(this.extractData)
          .catch(this.returnError);
      }
    });
})(window.app || (window.app = {}));
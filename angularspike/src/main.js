(function (app) {
  document.addEventListener('DOMContentLoaded', function () {
    ng.platformBrowserDynamic.bootstrap(app.LangsComponent);
  });
})(window.app || (window.app = {}));
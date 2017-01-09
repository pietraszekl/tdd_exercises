describe('fetch location test', function () {
  it('should get lat and lon from fetchLocation', function (done) {
    var onSuccess = function (location) {
      expect(location).to.have.property('lat');
      done();
    };
    var onError = function (err) {
      throw 'not expected';
    };
    this.timeout(20000);
    fetchLocation(onSuccess, onError);
  });
});
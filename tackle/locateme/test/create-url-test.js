describe('create url test', function () {
  it('should return proper given lat and lon', function () {
    var latitude = -33.975;
    var longitude = 151.075;
    var url = createURL(latitude, longitude);
    expect(url).to.be.eql('http://maps.google.com?q=-33.975,151.075')
  });
  it('should return proper given lat and lon', function () {
    var latitude = 33.975;
    var longitude = -151.075;
    var url = createURL(latitude, longitude);
    expect(url).to.be.eql('http://maps.google.com?q=33.975,-151.075')
  });
  it('should return empty string if latitude is undefined', function () {
    var latitude = undefined;
    var longitude = -151.075;
    var url = createURL(latitude, longitude);
    expect(url).to.be.eql('')
  });
  it('should return empty string if longitude is undefined', function () {
    var latitude = '123.131';
    var longitude = undefined;
    var url = createURL(latitude, longitude);
    expect(url).to.be.eql('')
  });
})
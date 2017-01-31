describe('tasks controller tests', function () {
  it('should pass this canary test', function () {
    expect(true).to.be.true;
  });

  var controller;
  beforeEach(module('todoapp'));
  beforeEach(inject(function ($controller) {
    controller = $controller('TasksController');
  }))
  it('tasks should be empty on create', function () {
    expect(controller.tasks).to.eql([]);
  })
});


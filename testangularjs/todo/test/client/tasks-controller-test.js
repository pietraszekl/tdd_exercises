describe('tasks controller tests', function () {

  var controller;
  var tasksServiceMock = {};
  var documentReadyHandler;

  beforeEach(module('todoapp'));
  beforeEach(inject(function ($controller, $document) {
    $document.ready = function (handler) {
      documentReadyHandler = handler;
    }
    controller = $controller('TasksController', {
      TasksService: tasksServiceMock
    });
  }));


  it('should pass this canary test', function () {
    expect(true).to.be.true;
  });

  it('tasks should be empty on create', function () {
    expect(controller.tasks).to.eql([]);
  });

  it('message should be empty on create', function () {
    expect(controller.message).to.eql('');
  });

  it('getTasks should interact with the service', function (done) {
    controller.updateTask = function () { };
    controller.updateError = function () { };
    tasksServiceMock.get = function (success, error) {
      expect(success).to.be.eql(controller.updateTasks);
      expect(error).to.be.eql(controller.updateError);
      done();
    };
    controller.getTasks();
  });

  it('updateTasks should update tasks', function () {
    var tasksStub = [{
      sample: 1
    }];
    controller.updateTasks(tasksStub);
    expect(controller.tasks).to.be.eql(tasksStub);
  });

  it('updateError should update message', function () {
    controller.updateError('Not Found', 404);
    expect(controller.message).to.be.eql('Not Found (status: 404)');
  });
  it('sortTasks should sort based on year', function () {
    var task1 = { name: 'task a', month: 1, day: 10, year: 2017 };
    var task2 = { name: 'task b', month: 5, day: 28, year: 2016 };
    var sorted = controller.sortTasks([task1, task2])
    expect(sorted).to.be.eql([task2, task1]);
  });
  it('sortTasks should by year, then by month', function () {
    var task1 = { name: 'task a', month: 2, day: 10, year: 2017 };
    var task2 = { name: 'task b', month: 1, day: 10, year: 2016 };
    var task3 = { name: 'task c', month: 1, day: 10, year: 2017 };
    var sorted = controller.sortTasks([task1, task2, task3])
    expect(sorted).to.be.eql([task2, task3, task1]);
  });
  it('sortTasks should by year, month then day', function () {
    var task1 = { name: 'task a', month: 1, day: 20, year: 2017 };
    var task2 = { name: 'task b', month: 1, day: 14, year: 2017 };
    var task3 = { name: 'task c', month: 1, day: 9, year: 2017 };
    var sorted = controller.sortTasks([task1, task2, task3])
    expect(sorted).to.be.eql([task3, task2, task1]);
  });
  it('sortTasks should by year, month, day then name', function () {
    var task1 = { name: 'task a', month: 1, day: 14, year: 2017 };
    var task2 = { name: 'task b', month: 1, day: 14, year: 2017 };
    var task3 = { name: 'task c', month: 1, day: 14, year: 2017 };
    var sorted = controller.sortTasks([task1, task2, task3])
    expect(sorted).to.be.eql([task1, task2, task3]);
  });
  it('updateTask should call sortTasks', function () {
    var tasksStub = [{ sample: 1 }];
    controller.sortTasks = function (tasks) {
      expect(tasks).to.be.eql(tasksStub);
      return '..sorted..';
    };
    controller.updateTasks(tasksStub);
    expect(controller.tasks).to.be.eql('..sorted..');
  });
  it('should register getTasks as handler for document ready', function () {
    expect(documentReadyHandler).to.be.eql(controller.getTasks);
  });
});


var TasksController = function () {
  var controller = this;
  controller.tasks = [];
};

angular.module('todoapp').controller('TasksController', [TasksController])
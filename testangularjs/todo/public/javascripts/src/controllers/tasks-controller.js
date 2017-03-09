var TasksController = function (tasksService, $filter, $document) {
  var controller = this;
  controller.tasks = [];
  controller.message = '';
  controller.getTasks = function () {
    tasksService.get(controller.updateTasks, controller.updateError);
  };
  controller.updateTasks = function (tasks) {
    controller.tasks = controller.sortTasks(tasks);
  };
  controller.updateError = function (error, status) {
    controller.message = error + ' (status: ' + status + ')';
  };
  controller.sortTasks = function (tasks) {
    var orderBy = $filter('orderBy');
    return orderBy(tasks, ['year', 'month', 'day', 'name']);
  };
  controller.newTask = { name: '', date: '' };
  controller.convertNewTaskToJSON = function () {
    var dateParts = controller.newTask.date.split('/')
    var newTask = {
      name: controller.newTask.name,
      day: parseInt(dateParts[0]),
      month: parseInt(dateParts[1]),
      year: parseInt(dateParts[2])
    }
    return newTask
  };
  controller.addTask = function () {
    tasksService.add(
      controller.convertNewTaskToJSON(controller.newTask),
      controller.updateMessage,
      controller.updateError);
  };
  $document.ready(controller.getTasks);
};

angular.module('todoapp').controller('TasksController', ['TasksService', '$filter', '$document', TasksController]);
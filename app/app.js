angular.module('studio',['ui.router'])

.config(function($stateProvider,$urlRouterProvider) {
  var studioState = {
    name: 'studio',
    url: '/',
    templateUrl: '/app/studio.template.html',
    controller:'studioController'
  }

  $stateProvider.state(studioState);
  $urlRouterProvider.otherwise('/');

});
(function(){
  angular.module('studio',[
                            'ui.materialize',
                            'ngAnimate',
                            'toastr',
                            'ui.router'
                          ]);

  angular.module('studio').config(function($stateProvider,$urlRouterProvider) {
    
    var studioState = {
      name: 'studio',
      url: '/',
      templateUrl: '/app/studio.template.html',
      controller:'studioController'
    }

    $stateProvider.state(studioState);
    $urlRouterProvider.otherwise('/');

  });

})();
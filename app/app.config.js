'use strict';

app

  .config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('login', {
              url: '/login',
              template: '<login></login>'
            })
            .state('map', {
              url: '/map',
              template: '<map auth="$resolve.auth"></map>',
              resolve: {
                  auth: ['$q', 'AuthService', function($q, AuthService) {
                      var userInfo = AuthService.getUserInfo();
                      if (userInfo) {
                          return $q.when(userInfo);
                      }
                      else {
                          return $q.reject({ authenticated: false });
                      }
                  }]
              }
            });

        $urlRouterProvider.otherwise('/map');
//        $urlRouterProvider.otherwise(function($injector, $state){
//          var $state = $injector.get('$state');
//          $state.go('map');
//        });
  }])

  .run(['$rootScope' ,'$state',
    function($rootScope, $state) {
      
      $rootScope.$on('$stateChangeSuccess', function(userInfo) {
          console.log(userInfo);
      });
        
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
          if (error.authenticated === false) {
            $state.go('login');
          }
      });
        
  }]);
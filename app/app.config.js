angular.module('statesApp')
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('login', {
                    url: '/login',
                    template: '<login></login>',
                    mode: 'public'
                })
                .state('map', {
                    url: '/map',
                    template: '<map auth="$resolve.auth"></map>',
                    mode: 'private',
                    resolve: {
                        auth: ['$q', 'DataService', function($q, DataService) {
                            let userInfo = DataService.getUserInfo();
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
            //$urlRouterProvider.otherwise(function($injector, $state){
            //  var $state = $injector.get('$state');
            //  $state.go('map');
            //});
            
        }
    ])

    .run(['$rootScope' ,'$state', 'DataService',
        function($rootScope, $state, DataService) {  

            // If logged in and transitioning to a public state
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                if (DataService.getUserInfo() && toState.mode === 'public' && fromState.mode === 'private') {
                    event.preventDefault();
                    //$state.reload();
                }
            });
            
            // If logged out and transitioning to a private state
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
                if (error.authenticated === false) {
                    $state.go('login');
                }
            });
            
        }        
    ]);
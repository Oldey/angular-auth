angular.module('statesApp')

    /**
     * @name statesApp.config
     * @description Configuration block. Defines app states, default route and private states resolve rules for user authentication purposes
     * 
     */
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
                    resolve: { // logged in user gets an access to this private state, otherwise stateChangeError event handler invokes
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
            // $urlRouterProvider.otherwise(function($injector, $state){
            //   var $state = $injector.get('$state');
            //   $state.go('map');
            // });
            
        }
    ])

    /**
     * @name statesApp.run
     * @description Run block. Attaches handlers for stateChangeStart and stateChangeError events so that state changes resolve appropriately
     *
     */
    .run(['$rootScope' ,'$state', 'DataService',
        function($rootScope, $state, DataService) {  

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                // if logged in and transitioning to a login state
                if (DataService.getUserInfo() && toState.name === 'login' && fromState.mode === 'private') {
                    event.preventDefault();
                    //$state.reload();
                }
            });
            
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
                // if logged out and transitioning to any private state
                if (error.authenticated === false) {
                    $state.go('login');
                }
            });
            
        }        
    ]);
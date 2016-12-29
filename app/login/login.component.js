angular.module('login')

    /**
     * @name login.component:login
     * @description Component provides user logging in functionality.
     * 
     */
    .component('login', {
        templateUrl: 'login/login.template.html',

        /**
         * @name login.controller:LoginController
         * @description Controller defines user logging in handling
         * 
         */
        controller: ['$state', 'AuthService', 'NotifyService',
        function LoginController($state, AuthService, NotifyService) {

            this.messages = {
                wrongCredentials: false,
                missedCredentials: false
            };

            // "Login button click" event handler 
            this.login = (loginForm) => {
                if (loginForm.$valid) {
                    AuthService.login(this.username, this.password)
                    .then(() => {
                        $state.go('map');
                    }, (error) => {
                        NotifyService.showMessage(this.messages, 'wrongCredentials');
                        console.log(error);
                    });
                }
                else {
                    NotifyService.showMessage(this.messages, 'missedCredentials');
                }
            };
            
        }]
    });
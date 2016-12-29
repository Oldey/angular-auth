// Register `login` component, along with its associated controller and template
angular.module('login')
  .component('login', {
    templateUrl: 'login/login.template.html',
    controller: ['$state', 'AuthService', 'NotifyService',
    function LoginController($state, AuthService, NotifyService) {

        this.messages = {
            wrongCredentials: false,
            missedCredentials: false
        };

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
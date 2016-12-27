'use strict';

// Register `login` component, along with its associated controller and template
app
  .component('login', {
    templateUrl: 'login/login.template.html',
    controller: ['$state', 'AuthService', 'NotifyService',
      function LoginController($state, AuthService, NotifyService) {
        
        var self = this;
        this.messages = {
            wrongCredentials: false,
            missedCredentials: false
        };

        this.login = function(loginForm) {
            if (loginForm.$valid) {
                AuthService.login(this.username, this.password)
                .then(function() {
                    $state.go('map');
                }, function (error) {
                    NotifyService.showMessage(self.messages, 'wrongCredentials');
                    console.log(error);
                });
            }
            else {
                NotifyService.showMessage(self.messages, 'missedCredentials');
            }
        };
        
      }
  ]});
'use strict';

// Register `login` component, along with its associated controller and template
app
  .component('login', {
    templateUrl: 'login/login.template.html',
    controller: ['$state', '$timeout', 'AuthService',
      function LoginController($state, $timeout, AuthService) {
       
        this.wrongCredentials = false;
        var self = this;  
        this.login = function () {
        AuthService.login(this.username, this.password)
            .then(function() {
                $state.go('map');
            }, function (error) {
                self.wrongCredentials = true;
                $timeout(function() {
                    self.wrongCredentials = false;
                }, 5000);
                console.log(error);
            });
        };

        this.cancel = function () {
            this.username = '';
            this.password = '';
        };
        
      }
  ]});
angular.module('core.auth')
    .factory('AuthService', ['$http', '$q', 'DataService',
        function($http, $q, DataService) {

            var _apiCallResult = (url, data, headers, p) => {
                let deferred = $q.defer();

                $http({
                    method: 'POST',
                    url: url,
                    data: data,
                    headers: headers
                }).then((result) => {
                    let userInfo = null;
                    if (p) userInfo = {
                        accessToken: result.data.access_token,
                        username: result.data.username,
                        dots: result.data.dots
                    };
                    DataService.setUserInfo(userInfo);
                    deferred.resolve(userInfo);
                }, (error) => {
                    deferred.reject(error);
                });

                return deferred.promise;
            };

            function login(username, password) {
                return _apiCallResult('/api/login', { username: username, password: password }, {}, true);
            };   
             
            function logout() {
                return _apiCallResult('/api/logout', {}, { 'access_token': DataService.getUserInfo().accessToken }, false);
            };

            function resetChanges() {
                return _apiCallResult('/api/reset', {}, { 'access_token': DataService.getUserInfo().accessToken }, true);
            };
                
            return {
                login,
                logout,
                resetChanges
            };

        }
    ]);
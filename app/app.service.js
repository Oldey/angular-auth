app
    .factory('AuthService', ['$http', '$q', '$window',
        function($http, $q, $window) {
            
            var userInfo;
            
            function login(username, password) {
                var deferred = $q.defer();

                $http.post('/api/login', { username: username, password: password })
                    .then(function (result) {
                        userInfo = {
                            accessToken: result.data.access_token,
                            username: result.data.username,
                            dots: result.data.dots
                        };
                        $window.localStorage['userInfo'] = JSON.stringify(userInfo);
                        deferred.resolve(userInfo);
                    }, function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            };
                
            function logout() {
                var deferred = $q.defer();

                $http({
                    method: 'POST',
                    url: '/api/logout',
                    headers: {
                        'access_token': userInfo.accessToken
                    }
                }).then(function (result) {
                    userInfo = null;
                    $window.localStorage['userInfo'] = null;
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };
                
            function getUserInfo() {
                return userInfo;
            }
            
            function init() {
                if ($window.localStorage['userInfo']) {
                    userInfo = JSON.parse($window.localStorage['userInfo']);
                }
            };
            init(); 
                
            function saveMapChanges(userInfo) {
                $window.localStorage['userInfo'] = JSON.stringify(userInfo);
            }
                
            function clearMapChanges() {
                var deferred = $q.defer();

                $http({
                    method: 'POST',
                    url: '/api/clear',
                    headers: {
                        'access_token': userInfo.accessToken
                    }
                }).then(function (result) {
                    userInfo = {
                        accessToken: result.data.access_token,
                        username: result.data.username,
                        dots: result.data.dots
                    };
                    $window.localStorage['userInfo'] = JSON.stringify(userInfo);
                    deferred.resolve(userInfo);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            return {
                login: login,
                logout: logout,
                getUserInfo: getUserInfo,
                saveMapChanges: saveMapChanges,
                clearMapChanges: clearMapChanges
            };

        }
    ])

    .factory('NotifyService', ['$timeout',
        function($timeout) {

            function showMessage(messages, action) {
                $timeout.cancel(messages.lastMessage);
                for(property in messages) {
                    if (messages[property]) {
                        messages[property] = false;
                        break;
                    }
                }
                messages[action] = true;
                messages.lastMessage = $timeout(function() {
                    messages[action] = false;
                }, 5000)
            };

            return {
                showMessage: showMessage
            };

        }

    ]);
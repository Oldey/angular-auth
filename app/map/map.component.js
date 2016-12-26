'use strict';

// Register `map` component, along with its associated controller and template
app
  .component('map', {
    bindings: {
      auth: '<'
    },
    templateUrl: 'map/map.template.html',
    controller: ['$scope', '$state', '$timeout', 'AuthService',
      function($scope, $state, $timeout, AuthService) {
          
          var self = this;
          this.userInfo = JSON.parse(JSON.stringify(this.auth));
          //this.userInfo = this.auth; // this.userInfo.dots - array of dots with properties: amount, name, x, y
          this.dots = this.userInfo.dots;
          this.current = {};
          this.currentIndex;
          this.getPercentW = {};
          this.getCoordW = {};
          this.getPercentH = {};
          this.getCoordH = {};
          this.updateCurrent = {};
          this.registerDragEventsHandler = {};
          this.messages = [];
          this.showMessage = function(i) {
              self.messages = [false, false, false, false, false, false, false];
              self.messages[i] = true;
              $timeout(function() {
                  self.messages[i] = false;
              }, 5000);
          }
          
          angular.element(document).ready(function () {

            self.s = Snap('#SVG');
            //document.getElementById('SVG').setAttribute('width', 1000);document.getElementById('SVG').setAttribute('height', 1000);
            document.getElementById('SVG').setAttribute('width', document.getElementById('SVG').getBoundingClientRect().width);
            document.getElementById('SVG').setAttribute('height', document.getElementById('SVG').getBoundingClientRect().height); 
      
            var w = +self.s.attr('width');
            var h = +self.s.attr('height');  
              
            self.getPercentW = function(coord) {
                return coord / w * 100;
            }
              
            self.getCoordW = function(percent) {
                return percent * w / 100;
            }
              
            self.getPercentH = function(coord) {
                return coord / h * 100;
            }
              
            self.getCoordH = function(percent) {
                return percent * h / 100;
            }
              
            self.updateCurrent = function(item) {
                return {
                    name: item.name,
                    amount: item.amount,
                    x: item.x,
                    y: item.y
                };
            }
            
            self.registerDragEventsHandler = function(item, i) {
                item.dot.drag(
                    function (dx, dy, posx, posy) {
                        this.attr( { cx: posx + window.pageXOffset - document.querySelector('.wrapper').offsetLeft, cy: posy + window.pageYOffset - document.querySelector('.header').clientHeight } );
                        item.x = self.getPercentW(this.attr('cx'));
                        item.y = self.getPercentH(this.attr('cy'));
                        AuthService.saveMapChanges(self.userInfo);
                        $scope.$apply(function() {
                            self.current = self.updateCurrent(item);
                        });
                    }, 
                    function() {
                        //console.log("Move started" + " cx = " + this.attr('cx') + " cy = " + this.attr('cy'));
                        $scope.$apply(function() {
                            self.current = self.updateCurrent(item);
                        });
                        self.currentIndex = i;
                    },
                    function() {
                        //console.log("Move stopped" + " cx = " + this.attr('cx') + " cy = " + this.attr('cy'));
                        item.x = self.getPercentW(this.attr('cx'));
                        item.y = self.getPercentH(this.attr('cy'));
                        AuthService.saveMapChanges(self.userInfo);
                        $scope.$apply(function() {
                            self.current = self.updateCurrent(item);
                        });
                    }
                );
            }
              
            self.dots.forEach(function(item, i, dots) {
                if (item) {
                    item.dot = self.s.circle(self.getCoordW(item.x), self.getCoordH(item.y), 10);
                    self.registerDragEventsHandler(item, i);
                }});
          });

        this.add = function() { // TODO manage adding an existent dot
          if (this.current && this.current.name && this.current.amount && this.current.x && this.current.y) {
            var dot = self.s.circle(self.getCoordW(this.current.x), self.getCoordH(this.current.y), 10);
            self.dots.push({
                name: this.current.name,
                amount: this.current.amount,
                x: this.current.x,
                y: this.current.y,
                dot: dot
            });
            AuthService.saveMapChanges(self.userInfo);
            var index = self.dots.length - 1;
            self.currentIndex = index;
            self.registerDragEventsHandler(self.dots[index], index);
            self.showMessage(0);
          }
          else {
              self.showMessage(1);
          }
        }      
              
        this.edit = function() {
          if (this.currentIndex) {
            if (this.current.name && this.current.amount && this.current.x && this.current.y) {
                self.dots[self.currentIndex].name = self.current.name;
                self.dots[self.currentIndex].amount = self.current.amount;
                var dx = self.getCoordW(self.dots[self.currentIndex].x - self.current.x);
                var dy = self.getCoordH(self.dots[self.currentIndex].y - self.current.y);
                self.dots[self.currentIndex].x = self.current.x;
                self.dots[self.currentIndex].y = self.current.y;
                AuthService.saveMapChanges(self.userInfo);
                self.dots[self.currentIndex].dot.attr( { cx: self.dots[self.currentIndex].dot.attr('cx') - dx, cy: self.dots[self.currentIndex].dot.attr('cy') - dy } );
                self.showMessage(2);
            }
            else {
                self.showMessage(3);
            }
          }
          else {
            self.showMessage(4);    
          }
        }
        
        this.delete = function() {
          if (this.currentIndex === 0 || this.currentIndex) {
              self.dots[self.currentIndex].dot.remove();
              this.current = null;
              delete self.dots[this.currentIndex];
              AuthService.saveMapChanges(self.userInfo);
              this.currentIndex = null;
              self.showMessage(5);
          }
          else {
              self.showMessage(6);
          }
        }    
        
        this.clear = function() {
          AuthService.clearMapChanges()
            .then(function (result) {
                this.userInfo = result;
                this.dots = result.dots;
                $state.reload();
            }, function (error) {
                console.log(error);
            });

        }
        
        this.logout = function() {
          AuthService.logout()
            .then(function (result) {
                this.userInfo = null;
                $state.go('login');
              console.log(self.s);
            }, function (error) {
                console.log('logout error', error);
            });
        };
          
      }
  ]});
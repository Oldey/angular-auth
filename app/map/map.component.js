'use strict';

// Register `map` component, along with its associated controller and template
app
    .component('map', {
        bindings: {
            auth: '<'
        },
        templateUrl: 'map/map.template.html',
        controller: ['$scope', '$state', 'AuthService', 'NotifyService',
        function($scope, $state, AuthService, NotifyService) {
            
            var self = this;
            this.userInfo = JSON.parse(JSON.stringify(this.auth));
            //this.userInfo = this.auth; // this.userInfo.dots - array of dots with properties: amount, name, x, y
            this.dots = this.userInfo.dots;
            this.canvasWidth;
            this.canvasHeight;
            this.dotRadius = 10;
            this.dotOffset = this.dotRadius / 10;
            this.current = {};
            this.currentIndex;
            this.getPercentW = {};
            this.getCoordW = {};
            this.getPercentH = {};
            this.getCoordH = {};
            this.updateCurrent = {};
            this.registerDragEventsHandler = {};
            this.messages = {
                added: false,
                edited: false,
                deleted: false
            };
            
            angular.element(document).ready(function () {

                self.canvas = Snap('#SVG');
                //document.getElementById('SVG').setAttribute('width', 1000);document.getElementById('SVG').setAttribute('height', 1000);
                document.getElementById('SVG').setAttribute('width', document.getElementById('SVG').getBoundingClientRect().width);
                document.getElementById('SVG').setAttribute('height', document.getElementById('SVG').getBoundingClientRect().height); 
        
                self.canvasWidth = +self.canvas.attr('width');
                self.canvasHeight = +self.canvas.attr('height');  
                
                self.getPercentW = function(coord) {
                    return coord / self.canvasWidth * 100;
                }
                
                self.getCoordW = function(percent) {
                    return percent * self.canvasWidth / 100;
                }
                
                self.getPercentH = function(coord) {
                    return coord / self.canvasHeight * 100;
                }
                
                self.getCoordH = function(percent) {
                    return percent * self.canvasHeight / 100;
                }
                
                self.updateCurrent = function(item) {
                    return {
                        name: item.name,
                        amount: item.amount,
                        x: item.x,
                        y: item.y
                    };
                }

                // The idea to limit the drag range of each circle is from here http://bl.ocks.org/mbostock/1557377
                // x is being limited to the range [radius, canvasWidth - radius]
                // y is being limited to the range [radius, canvasHeight - radius]
                self.registerDragEventsHandler = function(item, i) {
                    item.dot.drag(
                        function (dx, dy, posx, posy) { // drag move
                            var cx = posx + window.pageXOffset - document.querySelector('.wrapper').offsetLeft,
                                cy = posy + window.pageYOffset - document.querySelector('.header').clientHeight;
                            this.attr({ 
                                cx: Math.max(self.dotOffset, Math.min(self.canvasWidth - self.dotOffset, cx)), 
                                cy: Math.max(self.dotOffset, Math.min(self.canvasHeight - self.dotOffset, cy))
                            });
                            item.x = self.getPercentW(this.attr('cx'));
                            item.y = self.getPercentH(this.attr('cy'));
                            $scope.$apply(function() {
                                self.current = self.updateCurrent(item);
                            });
                        },
                        function() { // drag start
                            //console.log("Move started" + " cx = " + this.attr('cx') + " cy = " + this.attr('cy'));
                            $scope.$apply(function() {
                                self.current = self.updateCurrent(item);
                            });
                            self.currentIndex = i;
                        },
                        function() { // drag end
                            AuthService.saveMapChanges(self.userInfo);
                        }
                    );
                }
                
                self.dots.forEach(function(item, i, dots) {
                    if (item) {
                        item.dot = self.canvas.circle(self.getCoordW(item.x), self.getCoordH(item.y), self.dotRadius);
                        self.registerDragEventsHandler(item, i);
                    }});
            });

            this.add = () => { // TODO manage adding an existent dot
                var dot = self.canvas.circle(self.getCoordW(this.current.x), self.getCoordH(this.current.y), self.dotRadius);
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
                NotifyService.showMessage(self.messages, 'added');
            }      
                
            this.edit = function() {
                self.dots[self.currentIndex].name = self.current.name;
                self.dots[self.currentIndex].amount = self.current.amount;
                var dx = self.getCoordW(self.dots[self.currentIndex].x - self.current.x);
                var dy = self.getCoordH(self.dots[self.currentIndex].y - self.current.y);
                self.dots[self.currentIndex].x = self.current.x;
                self.dots[self.currentIndex].y = self.current.y;
                AuthService.saveMapChanges(self.userInfo);
                self.dots[self.currentIndex].dot.attr( { cx: self.dots[self.currentIndex].dot.attr('cx') - dx, cy: self.dots[self.currentIndex].dot.attr('cy') - dy } );
                NotifyService.showMessage(self.messages, 'edited');
            }
            
            this.delete = function() {
                self.dots[self.currentIndex].dot.remove();
                this.current = null;
                delete self.dots[this.currentIndex];
                AuthService.saveMapChanges(self.userInfo);
                this.currentIndex = null;
                NotifyService.showMessage(self.messages, 'deleted');
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
                }, function (error) {
                    console.log(error);
                });
            };
            
        }

    ]});
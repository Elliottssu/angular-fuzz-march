/**
 * 搜索自动提示
 * @parame placeholder: input提示内容
 * @parame url: 请求url地址
 * @parame searchContent: 绑定控制器中ng-model的参数
 * @parame firstParameter: 返回结果对象数组是否有上一级，有的话就填这个
 * @parame searchParameter: 在数据库中需要匹配的参数
 */

 .directive('autoMarch',function ($http, $timeout) {
     return {
         restrict :'E',
         scope: {
             "placeholder": "@",
             'url': '@',
             'searchContent': '=',
             'firstParameter': '@',
             'searchParameter': '@'
         },
         template :`<div>
                         <input type="text" placeholder="{{placeholder}}" ng-model="searchContent" ng-focus="showResult()" ng-blur="hideResult()" />
                         <div class="auto-dropdown" ng-if="dropDown" ng-mouseleave="hoverLeave()">
                             <div class="auto-result">
                                 <ul>
                                     <li ng-repeat="result in results track by $index" ng-bind-html="result" ng-mouseover="hoverRow($index)" ng-click="selectRow($index)" ng-class="{'auto-select-row': $index == selectIndex}"></li>
                                 </ul>
                             </div>
                         </div>
                    </div>`,
         link: function ($scope, elem, attrs) {
             $scope.selectIndex = -1;
             $scope.results = [];
             //绑定表单input键入事件
             elem.find('input').on('keyup', function(event){   
                 if (!(event.which == 38 || event.which == 40 || event.which == 13)) {      //keyCode 38:向上箭头 40向下箭头 13回车键
                     $timeout.cancel($scope.handleDelay);                              //每次键入都先cancel掉前面的定时器，保证页面中没有过多的定时器
                     $scope.handleDelay = $timeout($scope.handleEmpty(),50)           //延迟500毫秒，保证每次改变值都能改变，如果不加上的话会延迟一位字符             
                 } else {
                     if($scope.results.length > 0){         
                           switch(event.which) {
                               case 40 :
                                 if($scope.selectIndex >= $scope.results.length-1) {           //上下键让结果可以循环选中
                                     $scope.selectIndex = -1;
                                 }
                                 $scope.selectIndex ++;
                                 break;
                               case 38 :
                                 if($scope.selectIndex <= 0) {
                                     $scope.selectIndex = $scope.results.length;
                                 }
                                 $scope.selectIndex --;
                                 break;
                               case 13 :
                                 $scope.selectRow($scope.selectIndex);
                                 $scope.$apply();
                                 break;

                           } 
                           $scope.$apply();              //$scope.$apply()是用来检测selectIndex数据变化（angular库之外的才会用到）
                           event.preventDefault();       //取消与事件关联的默认动作
                           event.stopPropagation();      //停止事件传播
                     }
                 }
             })

             //处理空值
             $scope.handleEmpty = function () {   
                 $scope.results = [];   
                 $scope.selectIndex = -1;               
                 if ($scope.searchContent == '') {                                //如果搜索无内容，则隐藏所有显示
                     $scope.dropDown = false;
                 }else  {
                     $scope.handleSearchLogic($scope.searchContent);     //开始处理搜索                    
                 }             
             }

             //处理搜索逻辑 searchContent： 输入的搜索内容
             $scope.handleSearchLogic = function (searchContent) {
                 $scope.num = $scope.searchContent.length;
                 $http.get($scope.url + searchContent).success(function (data) {
                     $scope.handleSearchResult((($scope.firstParameter) ? data[$scope.firstParameter] : data ), searchContent);  //三元表达式的目的是当返回的结果目标数组对象如果有上一级key的话就处理，没有的话就直接输出
                 })
             }

             //处理搜索结果 respondContent: 请求模糊查询返回的数据库的数组对象   searchContetn: 输入的搜索内容
             $scope.handleSearchResult = function (respondContent, searchContent) {
                 if (respondContent && respondContent.length > 0) {           //返回结果不为空
                     $scope.dropDown = true; 
                     $scope.beforeResults = [];   //用来存放未处理过的数组，在点击显示的时候有用
                     $scope.results = [];         //定义一个数组来存放所有结果
                     for (var i = 0; i< respondContent.length; i++) {
                         var resultsStr = respondContent[i][$scope.searchParameter];
                         var reg = new RegExp(searchContent, 'i')       //为搜索内容创建一个正则对象，忽略大小写
                         var regMatch = resultsStr.match(reg)[0]                    //.match()方法规定要匹配的模式为 RegExp 对象，输出的是忽略大小的匹配结果
                         var regComplete = resultsStr.replace(reg, '<span class="auto-hightlight">'+ regMatch +'</span>')         //.replace()将正则对象替换掉
                         $scope.results.push(regComplete);
                         $scope.beforeResults.push(resultsStr)

                     }
                 } else {
                     $scope.dropDown = false;
                      $scope.results = []; 
                 }
             }  

             //鼠标移到相应的位置得到index，来区分每条记录 
             $scope.hoverRow = function (index) {
                 $scope.selectIndex = index;
             }

             //点击赋值
             $scope.selectRow = function (index) {
                 $scope.searchContent = $scope.beforeResults[index];
                 $scope.dropDown = false;
             }

             //显示结果(当有结果的时候菜显示)
             $scope.showResult = function () {
                 if($scope.results.length > 0){              
                     $scope.dropDown = true;
                 }
             }

             //隐藏结果(没有选中的时候才允许隐藏)
             $scope.hideResult = function () {               
                 if($scope.selectIndex < 0) {               
                     $scope.dropDown = false;
                 }              
             }

             //离开结果区域,移除样式
             $scope.hoverLeave = function () {
                 $scope.selectIndex = -1;
             }
         }
     }
 })
	      
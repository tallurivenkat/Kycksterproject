app.directive('bootstrapDatepicker', function(){
	return {
		require: '?ngModel',
		restrict: 'A',
		link: function ($scope, element, attrs, controller) {
			var updateModel, onblur;

			if (controller != null) {

				updateModel = function (event) {
					element.datepicker('hide');
					element.blur();
				};

				onblur = function () {
					var date = element.val();
					return $scope.$apply(function () {
						return controller.$setViewValue(date);
					});
				};

				controller.$render = function () {
					var date = controller.$viewValue;
					if (angular.isDefined(date) && date != null )
					{ 

						element.datepicker({autoclose: true, endDate: '0'}).data().datepicker.date =Date.parse(date); 
						element.datepicker("update", date);
					} else if (angular.isDefined(date)) {
						throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
					}
					return controller.$viewValue;
				};
			}
			return attrs.$observe('bootstrapDatepicker', function (value) {
				var options;
				options = {autoclose: true, endDate: '0' }; //<--- insert your own defaults here!
				if (angular.isObject(value)) {
					options = value;
				}
				if (typeof (value) === "string" && value.length > 0) {
					options = angular.fromJson(value);
				}
				return element.datepicker({autoclose: true, endDate: '0'}).on('changeDate', updateModel).on('blur', onblur);
			});
		}
	};
});
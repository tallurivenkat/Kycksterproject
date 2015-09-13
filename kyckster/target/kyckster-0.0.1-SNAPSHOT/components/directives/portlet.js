
app.directive('portlet', function() {
	'use strict';
	
	return {
		restrict : 'A',
		transclude: true,

		template : '<div class="row">' +
		          '<div class="col-md-12">' +
			      '<div class="well" id="porlet" style="margin-top:10px;' +
			      'border-style:solid; border-width:1px; border-color: black; background-color: #ffffff; padding-top: 0px; padding-left: 15px; padding-right: 15px;"' +      
			      '<div ng-transclude></div></div></div></div>'
	};
});


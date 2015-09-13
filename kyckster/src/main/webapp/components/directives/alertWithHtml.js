/**
 * This directive uses the bootstrap alert alert-danger box to show an error message
 * And optional, expandable HTML content below.  It is typically used when an HTTP exception
 * returns an error, which is given in full HTML, including a header, body, etc.
 * 
 * Use of the accordion component creates a transclusion error I can't seem to get around.
 * This is helpful to understand the problem:
 * http://ng.malsup.com/#!/$transclude-function
 * http://blog.omkarpatil.com/2012/11/transclude-in-angularjs.html
 * http://stackoverflow.com/questions/16653004/confused-about-angularjs-transcluded-and-isolate-scopes-bindings
 *  
 */
app.directive('alertWithHtml', function ($sanitize) {
	'use strict';

	return {
		
        restrict: 'E, A, C',
        templateUrl: 'components/directives/alertWithHtml.html',
        transclude: true,

        //Must use isolate scope since we can have multiple error boxes in a single controller
        scope: {
        	errorMsg:  "=",			//Maps to first line error msg
        	errorMsgHtml: "=",		//Maps to html content for collapse.  Null or undefined if not desired
       		errorPrefix: "@"		//Prefix text before errorMsg.  It CAN be HTML content i.e.  <strong>blah</strong>, but cannot be bound
        },

		link: function ( scope, element, attrs ) {

        	scope.$watch('errorMsgHtml', function() {

        		scope.errorMsgHtmlStripped = null;
        		
        		if ( scope.errorMsgHtml ) {
                	var bodyHtml = /<body.*?>([\s\S]*)<\/body>/i.exec(scope.errorMsgHtml);
                	if ( bodyHtml != undefined && bodyHtml.length > 1 )
                		scope.errorMsgHtmlStripped = bodyHtml[1];
                	else
                		scope.errorMsgHtmlStripped = scope.errorMsgHtml;
        		}
        	});
		}
	};
});

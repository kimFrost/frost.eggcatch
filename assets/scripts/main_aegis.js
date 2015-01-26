'use strict';

;(function(window, document, undefined) {
	var aegis = new window.Aegis({
		rootElem: document.querySelector('.banner')
		//states: {
		//	someState: false
		//}
	});

	//aegis.states.someState = true;

	//console.log(aegis);

	aegis.init();


	//aegis.states.someState = true;


})(window, window.document);
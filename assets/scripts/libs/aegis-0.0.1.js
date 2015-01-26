'use strict';

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

/**---------------------------------------
	Aegis v0.0.1
---------------------------------------**/
;(function(window, document, requestAnimFrame, undefined) {
	var _Aegis = function(optionArg) {
		var _private = {};
		var _public = this;
		_private.defaultOptions = {
			complete: null,
			e: null,
			obj: null,
			json: null,
			array: null,
			boolean: null,
			string: null,
			index: null,
			special: null
		};
		_public.options = {
			fixedUpdateTimer: 1000 
		};
		//_public.states = {};
		_private.data = {
			asignedIds: [],
			logCount: 0,
			rootElem: null,
			fixedUpdateTimer: null
		};
		_private.states = {
			ready: false,
			initialized: false
		};
/**---------------------------------------
	Create & Init
---------------------------------------**/
		// Parse plugin create options
		_private.create = function() {

			// Parse plugin arguments
			if (optionArg !== undefined) {
				for (var key in optionArg) {
					for (var privateKey in _private.data) {
						if (privateKey === key) {
							_private.data[privateKey] = optionArg[key];
						}
					}
					for (var publicKey in _public.options) {
						if (publicKey === key) {
							_public.options[publicKey] = optionArg[key];
						}
					}
				}
			}

			_private.init();
		};
		// Initiate part of the plugin
		_private.init = function() {

			_public.resize();
			/*
			$(window).on('resize',function() {
				// use smart resize instead
				// If responsive only
				_public.resize();
			});
			*/

			setInterval(function() {
				_private.data.rootElem.querySelectorAll('.banner__fps')[0].innerHTML = 'fps: ' + _private.data.fps;
				_private.data.fps = 0;
			},1000);

			_private.states.ready = true;
		};
		// Initiate the runtime update of the plugin
		_public.init = function() {

			// Check every 100ms if is ready until ready
			if (!_private.states.ready) {
				setTimeout(function() {
					_public.init();
				},100);
				return false;
			}

			_private.log(_private.data);

			if (_private.data.rootElem === null || _private.data.rootElem.length < 1) {
				return false;
			}

			if (!_private.states.initialized) {
				_private.construct();

				_private.setupBindings();
				_public.update();

				// Fixed Update
				_private.data.fixedUpdateTimer = setInterval(function() {
					_private.fixedUpdate();
				}, _public.options.fixedUpdateInterval);

				_private.states.initialized = true;
			}
		};
/**---------------------------------------
	Setup Bindings
---------------------------------------**/
		_private.setupBindings = function() {

		};
/**---------------------------------------
 	Construct
 ---------------------------------------**/
		_private.construct = function() {

			// aegis-class
			var elements = _private.data.rootElem.querySelectorAll('[aegis-class], [data-aegis-class]');
			var rootElemAttrs = _private.data.rootElem.attributes;
			if (rootElemAttrs['aegis-class'] !== undefined || rootElemAttrs['data-aegis-class'] !== undefined ) {
				//elements.push(_private.data.rootElem);
			}

			_private.log('elements', elements);
			_private.log('elements', typeof elements);
			_private.log('rootElemAttrs', rootElemAttrs);


			// aegis-click


		};
/**---------------------------------------
	Resize
---------------------------------------**/
		_public.resize = function() {
			//windowWidth = $(window).width();
			//windowHeight = $(window).height();
			//canvasWidth = canvas.width;
			//canvasHeight = canvas.height;
			//ctx = canvas.getContext('2d');
			//this.draw();
		};
/**---------------------------------------
	 Update
---------------------------------------**/
		_public.update = function() {
			requestAnimFrame(_public.update);


			_private.data.fps++;
		};
/**---------------------------------------
	 Fixed update
---------------------------------------**/
		_private.fixedUpdate = function() {

		};
/**---------------------------------------
	 Get Data Object (High performance by direct reference)
---------------------------------------**/
		_private.getObj = function(objId) {
			if (objId !== undefined && objId !== '') {
				for (var i=0;i<_private.data.asignedIds.length;i++) {
					var idObj = _private.data.asignedIds[i];
					if (objId === idObj.id) {
						return idObj.data;
					}
				}
			}
		};
/**---------------------------------------
	 Log
---------------------------------------**/
		// Console log
		_private.log = function(msg, msg2) {
			try {
				if (_private.data.logCount > 200) {
					console.clear();
					_private.data.logCount = 0;
				}
				if (msg !== undefined) {
					console.log(msg, msg2);
				}
				else {
					console.log(msg);
				}
				_private.data.logCount++;
			}
			catch(err) {
				//send error to developer platform
			}
		};
/**---------------------------------------
	 Asign Id
---------------------------------------**/
		_private.asignId = function(id, dataObj) {
			id = (id === undefined) ? null : id;
			dataObj = (dataObj === undefined) ? null : dataObj;
			var idFree = false,
				count = 0;
			while (!idFree) {
				if (id === null || count > 0) {
					id = _private.returnRandomId();
				}
				idFree = _private.validateId(id);
				count++;
			}
			_private.data.asignedIds.push({
				id: id,
				data: dataObj
			});
			return id.toString();
		};
		_private.returnRandomId = function() {
			var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var id = '';
			for (var i=0;i<5;i++) {
				id += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return id;
		};
		_private.validateId = function(id) {
			var found = false;
			for (var i=0;i<_private.data.asignedIds.length;i++) {
				var asignedId = _private.data.asignedIds[i];
				if (id === asignedId.id) {
					found = true;
				}
				break;
			}
			return !found;
		};
/**---------------------------------------
	 Callback
---------------------------------------**/
		_private.callback = function(options) {
			var o = (function(){
				var obj = {};
				for (var key1 in _private.defaultOptions) {
					obj[key1] = _private.defaultOptions[key1];
				}
				for (var key2 in options) {
					obj[key2] = options[key2];
				}
				return obj;
			})();
			if (o.complete && typeof(o.complete) === 'function') {
				o.complete();
			}
		};

		// Create
		_private.create();
	};
	// Expose to window scope
	window.Aegis = _Aegis;
})(window, window.document, window.requestAnimFrame);
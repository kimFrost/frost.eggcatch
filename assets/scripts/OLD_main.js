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

;(function(window, document, undefined) {

	var banner = {
		form: {
			elem:  document.querySelector('form'),
			inputs: {
				destinationFrom: {
					elem: document.querySelector('#destinationFrom'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: true
					}
				},
				destinationTo: {
					elem: document.querySelector('#destinationTo'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: true
					}
				},
				departureMonth: {
					elem: document.querySelector('#departureMonth'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: true
					}
				},
				departureDay: {
					elem: document.querySelector('#departureDay'),
					value: null,
					require: ['departureMonth'],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				returnMonth: {
					elem: document.querySelector('#returnMonth'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: true
					}
				},
				returnDay: {
					elem: document.querySelector('#returnDay'),
					value: null,
					require: ['returnMonth'],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				countAdults: {
					elem: document.querySelector('#countAdults'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: true
					}
				},
				countChildren: {
					elem: document.querySelector('#countChildren'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: true
					}
				},
				childOneAge: {
					elem: document.querySelector('#childOneAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				childTwoAge: {
					elem: document.querySelector('#childTwoAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				childThreeAge: {
					elem: document.querySelector('#childThreeAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				childFourAge: {
					elem: document.querySelector('#childFourAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				childHeadline: {
					elem: document.querySelector('#childHeadline'),
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				searchButton: {
					elem: document.querySelector('#searchButton'),
					value: null,
					require: ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay'],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
			}
		},
		departureDates: [],
		departureMonth: [],
		returnDates: [],
		returnMonths: [],
		logCount: 0,
		states: {
			valid: false
		}
	};
/**---------------------------------------
	Log
---------------------------------------**/
	banner.log = function(msg, msg2) {
		try {
			if (banner.logCount > 500) {
				console.clear();
				banner.logCount = 0;
			}
			if (msg !== undefined) {
				console.log(msg, msg2);
			}
			else {
				console.log(msg);
			}
			banner.logCount++;
		}
		catch(err) {
			//send error to developer platform
		}
	};
/**---------------------------------------
	Generate Dates & Month
---------------------------------------**/
	banner.daysInMonth = function(month, year) {
		var numOfDates =  new Date(year, (month+1), 0).getDate();
		var dates = [];
		for (var i=1;i<=numOfDates;i++) {
			dates.push(i);
		}
		return dates;
	};
	banner.generateCalender = function(daysInFuture, length) {
		var calender = [];
		for (var i=0;i<=(length-daysInFuture);i++) {
			var date = new Date();
			date.setDate(date.getDate() + i + daysInFuture);
			calender.push(date);
		}
		return calender;
	};
	banner.generateDates = function() {
		// Range 4-365
		var departureDates = banner.generateCalender(4, 365);
		var returnDates = banner.generateCalender(5, 365);

		var monthList = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];

		var i,
			date,
			month,
			year,
			ii,
			found,
			months;

		//departureDates
		months = [];
		for (i=0;i<departureDates.length;i++) {
			date = departureDates[i];
			month = date.getMonth();
			year = date.getFullYear();
			found = false;
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					found = true;
				}
			}
			if (!found) {
				months.push({
					value: year + ' ' + month,
					//name: monthList[month] + ' ' + year,
					name: monthList[month],
					month: month,
					year: year,
					dates: []
				});
			}
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					months[ii].dates.push(date);
				}
			}
		}
		banner.departureDates = months;

		//returnDates
		months = [];
		for (i=0;i<returnDates.length;i++) {
			date = returnDates[i];
			month = date.getMonth();
			year = date.getFullYear();
			found = false;
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					found = true;
				}
			}
			if (!found) {
				months.push({
					value: year + ' ' + month,
					//name: monthList[month] + ' ' + year,
					name: monthList[month],
					month: month,
					year: year,
					dates: []
				});
			}
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					months[ii].dates.push(date);
				}
			}
		}
		banner.returnDates = months;
		banner.updatesMonths();
	};
	banner.updatesMonths = function() {
		var i,
			month,
			year,
			addIndex,
			yearGroup,
			option,
			yearsPast = [];
		banner.form.inputs.departureMonth.elem.options.length = 1;
		//banner.form.inputs.departureMonth.elem.options.length = banner.departureDates.length + 1;
		yearsPast = [];
		addIndex = 1;
		for (i=0;i<banner.departureDates.length;i++) {
			month = banner.departureDates[i];
			if (yearsPast.indexOf(month.year) === -1) {
				yearGroup = document.createElement('optgroup');
				yearGroup.label = month.year;
				banner.form.inputs.departureMonth.elem.appendChild(yearGroup);
				yearsPast.push(month.year);
			}
			option = document.createElement('option');
			option.value = month.value;
			option.appendChild(document.createTextNode(month.name));
			yearGroup.appendChild(option);
			//banner.form.inputs.departureMonth.elem.options[i+addIndex] = new Option(month.name, month.value, false, false);
		}
		banner.form.inputs.returnMonth.elem.options.length = 1;
		//banner.form.inputs.returnMonth.elem.options.length = banner.returnDates.length + 1;
		yearsPast = [];
		addIndex = 1;
		for (i=0;i<banner.returnDates.length;i++) {
			month = banner.returnDates[i];
			if (yearsPast.indexOf(month.year) === -1) {
				yearGroup = document.createElement('optgroup');
				yearGroup.label = month.year;
				banner.form.inputs.returnMonth.elem.appendChild(yearGroup);
				yearsPast.push(month.year);
			}
			option = document.createElement('option');
			option.value = month.value;
			option.appendChild(document.createTextNode(month.name));
			yearGroup.appendChild(option);
			//banner.form.inputs.returnMonth.elem.options[i+1] = new Option(month.name, month.value, false, false);
		}
	};
	banner.updatesDates = function(departureDates, returnDates) {
		departureDates = (departureDates === undefined) ? false : departureDates;
		returnDates = (returnDates === undefined) ? false : returnDates;
		var i,
			month,
			ii,
			date;
		if (departureDates) {
			var departureMonthValue = banner.form.inputs.departureMonth.value;
			for (i=0;i<banner.departureDates.length;i++) {
				month = banner.departureDates[i];
				if (month.value === departureMonthValue) {
					banner.form.inputs.departureDay.elem.options.length = (month.dates.length + 1);
					for (ii=0;ii<month.dates.length;ii++) {
						date = month.dates[ii];
						banner.form.inputs.departureDay.elem.options[ii+1] = new Option(date.getDate(), date, false, false);
					}
					break;
				}
			}
		}
		if (returnDates) {
			var returnMonthValue = banner.form.inputs.returnMonth.value;
			for (i=0;i<banner.returnDates.length;i++) {
				month = banner.returnDates[i];
				if (month.value === returnMonthValue) {
					banner.form.inputs.returnDay.elem.options.length = (month.dates.length + 1);
					for (ii=0;ii<month.dates.length;ii++) {
						date = month.dates[ii];
						banner.form.inputs.returnDay.elem.options[ii+1] = new Option(date.getDate(), date, false, false);
					}
					break;
				}
			}
		}
	};
	banner.yyyymmdd = function(date) {
		date = new Date(date);
		var yyyy = date.getFullYear().toString();
		var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
		var dd  = date.getDate().toString();
		return yyyy + (mm[1]?mm:'0'+mm[0]) + (dd[1]?dd:'0'+dd[0]); // padding
	};
/**---------------------------------------
	Search Submit
---------------------------------------**/
	banner.encodeQueryData = function(data) {
		var ret = [];
		for (var d in data) {
			ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
		}
		return ret.join('&');
	};
	banner.searchSubmit = function() {
		var data = {};
		data.searchtype = 1;
		data.departurecity = banner.form.inputs.destinationFrom.value;
		data.arriveat = banner.form.inputs.destinationTo.value;
		data.departuredate = banner.yyyymmdd(banner.form.inputs.departureDay.value);
		data.returndate = banner.yyyymmdd(banner.form.inputs.returnDay.value);

		var queryString = banner.encodeQueryData(data);

		queryString = queryString + '&paxcombination=' + banner.form.inputs.countAdults.value + 'ADT' + ',' + banner.form.inputs.countChildren.value + 'CHD';
		if (banner.form.inputs.countChildren.value > 0) {
			queryString = queryString + '&roomchildage=' + (function(){
				var result = '';
				var i;
				for (i=0;i<parseInt(banner.form.inputs.countChildren.value); i++) {
					//result = result + '2,';
					switch(i) {
						case 0:
							result = result + banner.form.inputs.childOneAge.value + ',';
							break;
						case 1:
							result = result + banner.form.inputs.childTwoAge.value + ',';
							break;
						case 2:
							result = result + banner.form.inputs.childThreeAge.value + ',';
							break;
						case 3:
							result = result + banner.form.inputs.childFourAge.value + ',';
							break;
					}
				}
				return result;
			})();
		}
		var url = 'http://rejser.fdm-travel.dk/soeger?' + queryString;
		window.open(url,'_blank');
	};
/**---------------------------------------
	Value Change
---------------------------------------**/
	banner.valuesChange = function(event) {
		var id = event.target.id;
		var pointer = banner.form.inputs[id];
		pointer.value = event.target.value;
		pointer.states.changed = true;
		banner.updateStates();
	};
	banner.updateModelValues = function() {
		for (var key in banner.form.inputs) {
			input = banner.form.inputs[key];
			input.value = input.elem.value;
		}
	};
/**---------------------------------------
	Update States
---------------------------------------**/
	banner.updateStates = function(event) {
		// Update individual states
		var key,
			input;
		for (key in banner.form.inputs) {
			input = banner.form.inputs[key];
			if (input.value !== null && input.value !== '') {
				input.states.valid = true;
				input.states.changed = true;
			}
			else {
				input.states.valid = false;
				input.states.changed = true;
			}
		}
		// Update individual requirements
		for (key in banner.form.inputs) {
			input = banner.form.inputs[key];
			if (input.require.length > 0) {
				var anyInvalid = false;
				for (var i=0;i<input.require.length;i++) {
					var require = input.require[i];
					var required = banner.form.inputs[require];
					if (required !== undefined) {
						if (!required.states.valid) {
							anyInvalid = true;
							break;
						}
					}
				}
				input.states.disabled = anyInvalid;
				input.states.changed = true;
			}
		}

		// Update DOM elements
		banner.updateDOM();
	};
/**---------------------------------------
	Update DOM
---------------------------------------**/
	banner.updateDOM = function(event) {
		for (var key in banner.form.inputs) {
			var input = banner.form.inputs[key];
			if (input.states.changed) {
				// Handle disabled
				if (input.states.disabled && !input.elem.hasAttribute('disabled')) {
					input.elem.setAttribute('disabled', 'disabled');
					// Ugly
					input.elem.parentNode.setAttribute('disabled', 'disabled');
				}
				else if (!input.states.disabled && input.elem.hasAttribute('disabled')) {
					input.elem.removeAttribute('disabled');
					// Ugly
					input.elem.parentNode.removeAttribute('disabled');
				}
				// Handle valid
				if (input.states.valid) {

				}
				else {

				}
				// Reset change state
				input.states.changed = false;
			}
		}
	};
/**---------------------------------------
	Bindings
---------------------------------------**/

	// Special handling for child ages
	banner.form.inputs.countChildren.elem.addEventListener('change', function(event) {
		var value = event.target.value;
		value = parseInt(value);
		switch(value) {
			case 0:
				banner.form.inputs.childOneAge.states.disabled = true;
				banner.form.inputs.childTwoAge.states.disabled = true;
				banner.form.inputs.childThreeAge.states.disabled = true;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.childHeadline.states.disabled = true;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay'];
				break;
			case 1:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = true;
				banner.form.inputs.childThreeAge.states.disabled = true;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.childHeadline.states.disabled = false;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge'];
				break;
			case 2:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = false;
				banner.form.inputs.childThreeAge.states.disabled = true;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.childHeadline.states.disabled = false;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge', 'childTwoAge'];
				break;
			case 3:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = false;
				banner.form.inputs.childThreeAge.states.disabled = false;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.childHeadline.states.disabled = false;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge', 'childTwoAge', 'childThreeAge'];
				break;
			case 4:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = false;
				banner.form.inputs.childThreeAge.states.disabled = false;
				banner.form.inputs.childFourAge.states.disabled = false;
				banner.form.inputs.childHeadline.states.disabled = false;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge', 'childTwoAge', 'childThreeAge', 'childFourAge'];
				break;
		}
		banner.updateStates();
	}, false);


	// Handling for all inputs
	for (var key in banner.form.inputs) {
		var input = banner.form.inputs[key];
		input.elem.addEventListener('change', banner.valuesChange, false);
	}


	// Special handling for dates on month change
	banner.form.inputs.departureMonth.elem.addEventListener('change', function(event) {
		banner.updatesDates(true, false);
	});
	banner.form.inputs.returnMonth.elem.addEventListener('change', function(event) {
		banner.updatesDates(false, true);
	});

	// Handle search event
	banner.form.inputs.searchButton.elem.addEventListener('click', function(event) {
		if (!banner.form.inputs.searchButton.states.disabled) {
			banner.searchSubmit();
		}
	});

	banner.generateDates();
	banner.updateModelValues();
	banner.updateStates();

})(window, window.document);
var Ractive = require('ractive');
var getJSON = require('./utils/getjson'); 
var app;

/**
 * Update app using fetched JSON data
 * @param {object:json} data - JSON spreedsheet data.
 */
function updateView(data) {
	app = new Ractive( {
	    el: el,
	    template: require('./templates/base.html'),
	    data: {
	    	stories: data.stories,
	    	windowWidth: window.innerWidth,
	    	windowHeight: window.innerHeight
	    },
		components: {
			gallery: require('./components/gallery'),
			stories: require('./components/stories'),
			socialButtons: require('./components/socialButtons'),
			slide: require('./components/slide')
		}
	});


	window.addEventListener('onresize', measure);
}


/**
 * Boot the app.
 * @param {object:dom} el - <figure> element passed by boot.js. 
 */
function boot(el) {

	
	var key = '1o-i8CBAkcbm1t-qNKECzh6VKhlhqygPh2dBhSf-ygLQ';
	var folder = (window.location.hostname.search('localhost') > -1 ) ? 'docsdata-test' : 'docsdata';
	var url = '//visuals.guim.co.uk/'+folder+'/'+key+'.json';
	getJSON(url, updateView);
}

function measure(){
	var params = {
		windowWidth: window.innerWidth,
		windowHeight: window.innerHeight
	};

	app.set(params);
}

// AMD define for boot.js
define(function() { return { boot: boot }; });

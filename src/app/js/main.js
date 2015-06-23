var Mustache = require('mustache');
var Swiper = require('swiper');
var getJSON = require('./utils/getjson'); 

var app;
var el;
var storyData;
var windowSize;
/**
 * Update app using fetched JSON data
 * @param {object:json} data - JSON spreedsheet data.
 */
function render(data){
	storyData = data;
	updateView(storyData);
}


function updateView(data) {

	var rendered = Mustache.render(
						require('./templates/base.html'), 
						{
							stories: data.stories,
							windowSize: windowSize,
							shellLayout: (windowSize.windowWidth <=640) ? 'v' : 'h',
							storyLayout: (windowSize.windowWidth <=640) ? 'h' : 'v'
						},
						{
							gallery: require('./templates/gallery.html'),
							slide: require('./templates/slide.html')
						}
					);
	el.innerHTML = rendered;

	//init horizontal sqipers
	var vSwipers = el.getElementsByClassName('swiper-container-v')
	var hSwipers = el.getElementsByClassName('swiper-container-h')

	initSwipers(hSwipers, 'horizontal');
	initSwipers(vSwipers, 'vertical');



	

	//window.addEventListener('onresize', measure);
}

function initSwipers(elems, direction){

	for(var i = 0; i < elems.length; i++) {

		new Swiper(elems[i], {
	        pagination: elems[i].getElementsByClassName('swiper-pagination-' + direction.charAt(0) )[0] ,
	        paginationClickable: true,
	        spaceBetween: 1,
	        direction: direction,
	        paginationClickable: elems[i].getElementsByClassName('swiper-pagination-' + direction.charAt(0) )[0],
	        nextButton: elems[i].getElementsByClassName('swiper-button-next'),
	        prevButton: elems[i].getElementsByClassName('swiper-button-prev'),
	        keyboardControl: true,
	        mousewheelControl: (direction === 'vertical') ? true : false
	    });

	}

}




/**
 * Boot the app.
 * @param {object:dom} el - <figure> element passed by boot.js. 
 */
function boot(div) {

	el = div;
	windowSize = measure();
	
	var key = '1o-i8CBAkcbm1t-qNKECzh6VKhlhqygPh2dBhSf-ygLQ';
	var folder = (window.location.hostname.search('localhost') > -1 ) ? 'docsdata-test' : 'docsdata';
	var url = '//visuals.guim.co.uk/'+folder+'/'+key+'.json';
	getJSON(url, updateView);
}

function measure(){
	return params = {
		windowWidth: window.innerWidth,
		windowHeight: window.innerHeight
	};


}

// AMD define for boot.js
define(function() { return { boot: boot }; });

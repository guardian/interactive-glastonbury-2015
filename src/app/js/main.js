var Mustache = require('mustache');
var Swiper = require('swiper');
var getJSON = require('./utils/getjson'); 

var app;
var el;
var storyData;
var windowSize;
var slides;
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
							storyLayout: (windowSize.windowWidth <=640) ? 'h' : 'v',
							getPhotoData: function(){
					
								if(windowSize.windowWidth <=640 && this.alt){

									return this.alt;
								} else {
									return this;
								}							
							}
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

	slides = el.getElementsByClassName('swiper-slide-photo-pending');

	lazyload();



	

	//window.addEventListener('onresize', measure);
}

function lazyload(){

	for( var s = 0; s < slides.length ; s ++){

		if ( slides[s].className.search('swiper-slide-active') > -1 || slides[s].className.search('swiper-slide-prev') > -1 || slides[s].className.search('swiper-slide-next') > -1  ){
			addBgImg(slides[s]);
		}	

	}

	slides = el.getElementsByClassName('swiper-slide-photo-pending');

}

function addBgImg(div){
	

	div.className.replace('swiper-slide-photo-pending', '');

	var sizes = div.getAttribute('data-img-sizes').split(',');
	var w = div.offsetWidth;
	for(var i = 0; i < sizes.length; i ++){
		
		if( Number(sizes[i]) > w ){
			size = sizes[i];
			break;
		}

		if(i == sizes.length-1){
			size = sizes[i];
		}

	}



	var src = div.getAttribute('data-img-src');
	var url = src + '/' + size + '.jpg';
	div.style.backgroundImage = "url(" + url + ")";

}



function initSwipers(elems, direction){

	for(var i = 0; i < elems.length; i++) {

		var gallery = new Swiper(elems[i], {
	        pagination: elems[i].getElementsByClassName('swiper-pagination-' + direction.charAt(0) )[0] ,
	        paginationClickable: true,
	        spaceBetween: 1,
	        direction: direction,
	        paginationClickable: elems[i].getElementsByClassName('swiper-pagination-' + direction.charAt(0) )[0],
	        nextButton: elems[i].getElementsByClassName('swiper-button-next'),
	        prevButton: elems[i].getElementsByClassName('swiper-button-prev'),
	        keyboardControl: true
	       //mousewheelControl: (direction === 'vertical') ? true : false
	    });

	    gallery.on('slideChangeStart', function () {
		    lazyload();
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

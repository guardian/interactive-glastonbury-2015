var Mustache = require('mustache');
var Swiper = require('swiper');
var getJSON = require('./utils/getjson'); 
var detect = require('./utils/detect'); 

var app;
var el;
var storyData;
var windowSize;
var slides;
var globalData;
/**
 * Update app using fetched JSON data
 * @param {object:json} data - JSON spreedsheet data.
 */
function render(data){
	storyData = data;
	updateView(storyData);
}

function updateView(data) {
	globalData = data.config;
	var storyData = data.stories.map(function(story,i){
		story.isFirst = i === 0 ? true : false
		story.slides = story.slides.map(function(slide,i){
			slide.isPhoto = slide.slide === "photo" ? true : false
			slide.isQuote = slide.slide === "quote" ? true : false
			slide.isEnd = slide.slide === "end" ? true : false
			slide.isFirst = i === 0 ? true : false
			slide.isTitle = slide.slide === "title" ? true : false
			slide.storyTitle = story.story
			if(slide.isTitle){
				story.navImage = slide.src + "/" + slide.sizes[0] + '.jpg'
			}
			return slide
		})
		return story
	})

	var rendered = Mustache.render(
		require('./templates/base.html'), 
		{
			stories: data.stories,
			config: data.config,
			windowSize: windowSize,
			shellLayout: (windowSize.windowWidth <=740) ? 'v' : 'h',
			storyLayout: (windowSize.windowWidth <=740) ? 'h' : 'v',
			getPhotoData: function(){
			
				if(windowSize.windowWidth <=740 && this.alt){

					return this.alt;
				} else {
					return this;
				}							
			},
			isDesktop: function(){
				return (windowSize.windowWidth <=740) ? false : true;
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
	slides = el.querySelectorAll('.swiper-slide-title, .swiper-slide-active');

	lazyload();
	initShare();
	//window.addEventListener('onresize', measure);
}

function lazyload(){
	
	console.log(slides)
	for( var s = 0; s < slides.length ; s ++){
		console.log(slides[s], slides[s].className.search('active'))
		if ( slides[s].className.search('active') > -1 || slides[s].className.search('prev') > -1 || slides[s].className.search('next') > -1  ){
			
			addBgImg(slides[s]);
			
		}	
	}
	slides = el.getElementsByClassName('swiper-slide-pending');
	

}

function addBgImg(div){
	div.className = div.className.replace('swiper-slide-pending', '');
	var sizes = div.getAttribute('data-img-sizes').split(',');
	var w = div.offsetWidth;
	
	for(var i = 0; i < sizes.length; i ++){
		if( Number(sizes[i]) * .6 > w ){
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
	        pagination: 		(windowSize.windowWidth > 640 && direction === 'horizontal') ? '' : elems[i].getElementsByClassName('swiper-pagination-' + direction.charAt(0) )[0],
	        paginationClickable: true,
	        spaceBetween: 0,
	        direction: direction,
	        paginationClickable: elems[i].getElementsByClassName('swiper-pagination-' + direction.charAt(0) )[0],
	        nextButton:  function(){
	        	if(windowSize.windowWidth > 740 && direction === 'horizontal'){
	        		return elems[i].getElementsByClassName('swiper-end-gallery');
	        	} else if(windowSize.windowWidth > 740 && direction === 'vertical'){

	        		return elems[i].getElementsByClassName('swiper-slide-middle');
	        	}else if(windowSize.windowWidth <= 740 && direction === 'horizontal'){
	        		return elems[i].getElementsByClassName('swiper-button-next');
	        	}
	        	return '';
	        }(),
	        prevButton: (windowSize.windowWidth > 740 && direction === 'horizontal') ?  elems[i].getElementsByClassName('swiper-button-prev'): '',
	        keyboardControl: true,
	 		
			mousewheelControl: (direction === 'vertical') ? true : false,
			mousewheelReleaseOnEdges: true,
			freeModeMomentumBounce: false

	    });

	    gallery.on('slideChangeStart', function () {
		    lazyload();
		});

	    if(direction === 'horizontal' && windowSize.windowWidth > 740){
			gallery.on('onSlideChangeEnd', function(){
				var currentActive = document.querySelector('.swiper-navigation-item.active');
				currentActive.className = currentActive.className.replace(" active","");
				var newActive = document.querySelectorAll('.swiper-navigation-item')[gallery.activeIndex]
				newActive.className = newActive.className + " active";
			})

			var btns = document.querySelectorAll('.swiper-navigation-item');
			for(var i=0;i<btns.length;i++){
				btns[i].setAttribute('data-btn-id', i)
		        btns[i].addEventListener('click', function(){
		        	gallery.slideTo(this.getAttribute('data-btn-id'));
		        	console.log(this)
		        }, false);
		    }
		}
	}

}



function initShare(){
	var shareButtons = document.querySelectorAll('.shareButtonContainer button');
	for(var i = 0; i < shareButtons.length; i++){
		var shareButton = shareButtons[i];
		shareButton.addEventListener('click',shareStory)
	}

	shareButtons = document.querySelectorAll('.gv-btn');
	for(var i = 0; i < shareButtons.length; i++){
		var shareButton = shareButtons[i];
		shareButton.addEventListener('click',shareStory)
	}

	if(detect.isFacebookReferral() ){
		document.getElementById('gv-share-facebook').style.display = 'block';
	} else if(detect.isTwitterReferral() ){
		document.getElementById('gv-share-twitter').style.display = 'block';
	}
}

function shareStory(e){
	var platform;
	var shareWindow;
    var twitterBaseUrl = "http://twitter.com/share?text=";
    var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
    var shareUrl = globalData.url;
    var message = globalData.sharetext;
    var shareImage = globalData.shareimage;
    var twitterpic = globalData.twitterpic;
     
    if(e.target.className.search('twitter') > -1){
    	platform = 'twitter';
        shareWindow = 
            twitterBaseUrl + 
            encodeURIComponent(message + " " + twitterpic) + 
            "&url=" + 
            encodeURIComponent(shareUrl)   
    }else if(e.target.className.search('facebook') > -1){
    	platform = 'facebook';
        shareWindow = 
            facebookBaseUrl + 
            encodeURIComponent(shareUrl) + 
            "&picture=" + 
            encodeURIComponent(shareImage) + 
            "&redirect_uri=http://www.theguardian.com";
    } else if(e.target.className.search('mail') > -1){
    	platform = 'mail';
        shareWindow =
            "mailto:" +
            "?subject=" + message +
            "&body=" + shareUrl 
    }
    window.open(shareWindow, platform + "share", "width=640,height=320");     
}





/**
 * Boot the app.
 * @param {object:dom} el - <figure> element passed by boot.js. 
 */
function boot(div) {

	el = div;
	windowSize = measure();
	//	var key = '1o-i8CBAkcbm1t-qNKECzh6VKhlhqygPh2dBhSf-ygLQ';

	var params = parseUrl(el);
    if(params.key){
   
        var folder = (window.location.hostname.search('localhost') > -1  || window.location.hostname.search('interactive.guim.co.uk') > -1) ? 'docsdata-test' : 'docsdata';
		var url = 'http://interactive.guim.co.uk/'+folder+'/'+params.key+'.json';
		getJSON(url, updateView);
    } else {
        console.log('Please enter a key in the alt text of the embed or as a param on the url in the format "key="" ')
    }

	


	
}

function measure(){
	return params = {
		windowWidth: window.innerWidth,
		windowHeight: window.innerHeight
	};


}

function parseUrl(el){
    
    var urlParams; 

    //sample ?key=1H2Tqs-0nZTqxg3_i7Xd5-VHd2JMIRr9xOKe72KK6sj4

    if(el.getAttribute('data-alt')){
        //pull params from alt tag of bootjs
        urlParams = el.getAttribute('data-alt').split('&');

    } else if(urlParams == undefined){
        //if doesn't exist, pull from url param
        urlParams = window.location.search.substring(1).split('&');
        liveLoad = true;
    }


    var params = {};
    urlParams.forEach(function(param){
        var pair = param.split('=');
        params[ pair[0] ] = pair[1];
    })
    
    return params;
}

// AMD define for boot.js
define(function() { return { boot: boot }; });

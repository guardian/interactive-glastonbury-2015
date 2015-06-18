var Ractive = require('ractive');
var Swiper = require('swiper');


var render = function(){
	var el = this;


	var swiperH = new Swiper(el.find('.swiper-container-h'), {
        pagination: el.find('.swiper-pagination-h'),
        paginationClickable: true,
        spaceBetween: 50,
        hashnav: true,
        keyboardControl: true
    });
    var swiperV = new Swiper(el.find('.swiper-container-v'), {
        pagination: el.find('.swiper-pagination-v'),
        paginationClickable: true,
        direction: 'vertical',
        spaceBetween: 1,
        mousewheelControl: true,
        keyboardControl: true

    });


}

module.exports = Ractive.extend({
	isolated: false,
	template: require('./gallery.html'),
	onrender: render
});

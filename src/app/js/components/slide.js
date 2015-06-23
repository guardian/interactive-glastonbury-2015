var Ractive = require('ractive');
var Swiper = require('swiper');


var render = function(){
	var el = this;


	var swiperH = new Swiper(el.find('.swiper-container'), {
        pagination: el.find('.swiper-pagination'),
        paginationClickable: true,
        spaceBetween: 50,
        hashnav: true,
        direction: 'vertical',
        keyboardControl: true
    });

}

module.exports = Ractive.extend({
	isolated: false,
	template: require('./slide.html'),
    computed: {
        getLayout: function(){
            var w = this.get('windowWidth');

            if( w < 640 ) {
               return 'h'
            } else {
                return 'v'
            }
        }
    },
	onrender: render
});

const Toolbar = (function ($) {

    const HTML = "<div id='collabtoolbar'><button>TEST</button></div>";

    function Toolbar($container) {
      H5P.EventDispatcher.call(this);
      this.$el = $(HTML).appendTo($container);
      this._$container = $container;
      console.log(this.$el);
    }
  
    // extends H5P.EventDispatcher
    Toolbar.prototype = Object.create(H5P.EventDispatcher.prototype);
    Toolbar.prototype.constructor = Toolbar;

    return Toolbar;
  
  })(H5P.jQuery);
  
  export default Toolbar;
  
const Settings = (function ($) {

    function Settings($container) {
      let html = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><div id='collabSettings'>";
      html += "<h1 style='color: gray'>Chat</h1>";
      html += "</div>";

      H5P.EventDispatcher.call(this);
      this.$el = $(html).appendTo($container);
      this._$container = $container;
    }
  
    // extends H5P.EventDispatcher
    Settings.prototype = Object.create(H5P.EventDispatcher.prototype);
    Settings.prototype.constructor = Settings;

    return Settings;
  
  })(H5P.jQuery);
  
  export default Settings;
  
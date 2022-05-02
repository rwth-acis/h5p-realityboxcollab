const Toolbar = (function ($) {

    const TOOLS = [ // https://www.w3schools.com/bootstrap/bootstrap_ref_comp_glyphs.asp
      {name: "Orbit"},
      {name: "FP"},
      {name: "<i class='glyphicon glyphicon-move'></i>"},
    ];

    function Toolbar($container) {
      let html = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><div id='collabToolbar'>";
      for (let tool of TOOLS) {
        html += `<button>${tool.name}</button>`;
      }
      html += "</div>";

      H5P.EventDispatcher.call(this);
      this.$el = $(html).appendTo($container);
      this._$container = $container;
    }
  
    // extends H5P.EventDispatcher
    Toolbar.prototype = Object.create(H5P.EventDispatcher.prototype);
    Toolbar.prototype.constructor = Toolbar;

    return Toolbar;
  
  })(H5P.jQuery);
  
  export default Toolbar;
  
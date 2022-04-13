H5P.RealityBoxCollab = (function ($) {

  function RealityBoxCollab(options, id) {
    console.log("XXXXXXXXXXXXXXXXXX");
  }

  RealityBoxCollab.prototype.attach = async function ($container) {
    const realitybox = H5P.newRunnable({
      library: 'H5P.Realitybox 1.0',
      params
    }, this.id, undefined, undefined, {parent: this});
  }

  return RealityBoxCollab;

})(H5P.jQuery);

export default H5P.RealityBoxCollab;

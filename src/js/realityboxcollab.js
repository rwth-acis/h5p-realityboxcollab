H5P.RealityBoxCollab = (function ($) {

  function RealityBoxCollab(options, id) {
    this.options = options.realityboxcollab;
  }

  RealityBoxCollab.prototype.attach = async function ($container) {
    const realitybox = H5P.newRunnable({
      library: 'H5P.RealityBox 1.0',
      params: {realitybox: this.options}
    }, this.id, undefined, undefined, { parent: this });

    await realitybox.attach($container);
  }

  return RealityBoxCollab;

})(H5P.jQuery);

export default H5P.RealityBoxCollab;

// SVGO configuration
// https://github.com/svg/svgo

module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // disable plugins
          removeTitle: false,
          removeDesc: false
        },
      },
    }
  ],
  js2svg: {
    // pretty print with simple indent for readability
    indent: 1,
    pretty: true
  }
};

module.exports = api => {
  if (api.env("test")) {
    return {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current"
            }
          }
        ]
      ]
    };
  }

  return {
    presets: [["@babel/preset-env", { loose: false }]],
    plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
          useESModules: true
        }
      ]
    ]
  };
};

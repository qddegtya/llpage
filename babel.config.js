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
    presets: [
      ["@babel/preset-env", {
        // 禁用松散模式，确保代码更符合标准
        loose: false, 
        // 此目标配置确保生成的代码兼容 Electron 和现代浏览器
        targets: {
          node: "12",
          browsers: ["last 2 chrome versions", "last 2 firefox versions", "last 2 safari versions"]
        }
      }]
    ],
    // 内联生成 helper 函数，而不是通过 runtime 引入
    plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
          // 禁用 helpers 的外部引用，让 Babel 内联生成所有 helper 函数
          helpers: false,
          // 生成 ES modules 语法的代码，webpack 可以处理
          useESModules: true
        }
      ]
    ]
  };
};

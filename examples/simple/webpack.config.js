const path = require('path')
const fs = require('fs')
const zipObject = require('lodash.zipobject')

// config
const DEFAULT_MODE = 'development'
const ENTRY_FILE_NAME = 'index.jsx'
const ENTRY_DIR_NAME = 'src'
const DIST_NAME = 'build'
const DEFAULT_DEV_SERVER_PORT = 8099

const getEntries = dir => {
  const _name = fs
    .readdirSync(dir)
    .map(p => path.resolve(dir, p))
    .filter(p => !fs.statSync(p).isFile())
  const _path = _name.map(p => path.resolve(p, ENTRY_FILE_NAME))
  const ret = zipObject(_name.map(n => path.basename(n)), _path)
  return ret
}

if (module.parent === null) {
  // main
  getEntries(path.join(__dirname, ENTRY_DIR_NAME))
} else {
  module.exports = {
    mode: process.env.W_MODE || DEFAULT_MODE,
    entry: getEntries(path.join(__dirname, ENTRY_DIR_NAME)),
    output: {
      path: path.resolve(__dirname, DIST_NAME),
      filename: '[name].dist.js',
      publicPath: '/build/',
      globalObject: 'this'
    },

    module: {
      rules: [
        {
          // 处理 llpage 库文件
          test: /[\\/]lib[\\/].*\.js$/,
          include: [path.resolve(__dirname, '../../lib')],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', {
                modules: false, // 这时候我们需要转换成 ES 模块
                targets: {
                  browsers: ["last 2 chrome versions", "last 2 firefox versions"]
                }
              }]],
            }
          }
        },
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: [/node_modules/, path.resolve(__dirname, '../../lib')], // 排除 llpage lib
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              [
                '@babel/plugin-transform-runtime',
                {
                  'useESModules': true
                }
              ]
            ]
          }
        }
      ]
    },

    resolve: {
      alias: {
        'llpage': path.join(__dirname, '..', '..', 'index.js')
      }
    },

    devServer: {
      contentBase: path.join(__dirname),
      port: DEFAULT_DEV_SERVER_PORT || process.env.W_PORT,
      compress: true,
      open: true,
      host: '0.0.0.0',
      useLocalIp: true
    }
  }
}

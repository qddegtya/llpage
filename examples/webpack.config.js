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
      publicPath: '/build/'
    },

    module: {
      rules: [
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
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
        'llpage': path.join(__dirname, '..', 'index.js')
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

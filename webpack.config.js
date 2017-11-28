const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cssnext = require('postcss-cssnext')
const nested = require('postcss-nested')
const mqpacker = require('css-mqpacker')
const cssnano = require('cssnano')
const easyImport = require('postcss-easy-import')
const notifier = require('node-notifier')

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'public/static'),
    publicPath: '/static/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
              plugins: ['transform-object-rest-spread']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                localIdentName: '[local]--[hash:base64]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => {
                  return [
                    easyImport({
                      root: path.resolve(__dirname, 'src')
                    }),
                    nested(),
                    cssnext({
                      warnForDuplicates: false
                    }),
                    mqpacker(),
                    cssnano({
                      discardUnused: {
                        fontFace: false,
                        keyframes: false
                      },
                      zindex: false,
                      reduceIdents: false
                    })
                  ]
                }
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('index.css'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new FriendlyErrorsWebpackPlugin({
      onErrors(severity, errors) {
        if (severity !== 'error') {
          return
        }
        const error = errors[0]

        notifier.notify({
          title: 'Webpack error',
          message: severity + ': ' + error.name,
          subtitle: error.file || ''
        })
      }
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: path.resolve(__dirname, 'public/index.html'),
      minify: {
        html5: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeComments: true,
        removeEmptyAttributes: true
      }
    }),
    new CopyWebpackPlugin([
      {
        context: path.resolve(__dirname, 'src/images'),
        from: '**/*',
        to: path.resolve(__dirname, 'public/static/images')
      }
    ])
  ]
}

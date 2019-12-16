const {  resolve } = require('path')
const merge = require('webpack-merge')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const common = require('./webpack.common.config.js')
module.exports = merge(common, {
  mode: 'development',
  output: {
    path: resolve(__dirname, './debug')
  },
  // 输出 source-map 方便直接调试 ES6 源码
  devtool: 'source-map',
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    // 清理目录
    // new CleanWebpackPlugin(['debug']),
    // 优化：拷贝静态文件
    new CopyWebpackPlugin([
      {
        from: resolve(__dirname, 'index.html'),
        to: resolve(__dirname, 'debug', 'index.html')
      },
      {
        from: resolve(__dirname, './static'),
        to: resolve(__dirname, 'debug', './static'),
        ignore: ['.*']
      }
    ]),
    new HtmlWebpackPlugin({
      title: '[DEV]Goat Web Template',
      filename: resolve(__dirname, './debug/index.html'),
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    }),
    // 优化：增强代码代码压缩工具
    new ParallelUglifyPlugin({
      cacheDir: '.cache/', // 缓存压缩后的结果目录
      include: [], // 使用正则去包含被压缩的文件
      exclude: [/\.min\.js$/], // 使用正则去不包含被压缩的文件
      cache: true,
      parallel: true,
      sourceMap: true,
      uglifyJS: {
        output: {
          beautify: false, // 不需要格式化
          comments: false // 保留注释
        },
        compress: { // 压缩
          warnings: false, // 删除无用代码时不输出警告
          drop_console: true, // 删除console语句
          collapse_vars: true, // 内嵌定义了但是只有用到一次的变量
          reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
        }
      }
    }),
    // 开发预览
    new BrowserSyncPlugin({
      // browse to http://localhost:3000/ during development,
      // ./public directory is being served
      host: 'localhost',
      port: 8080,
      server: { baseDir: ['debug'] }
    })
  ]
})

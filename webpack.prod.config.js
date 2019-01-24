const {  resolve } = require('path')
const merge = require('webpack-merge')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const common = require('./webpack.common.config.js')
module.exports = merge(common, {
  mode: 'production',
  output: {
    path: resolve(__dirname, './dist/')
  },
  plugins: [
    // 清理目录
    new CleanWebpackPlugin(['./dist/']),
    // 优化：拷贝静态文件
    new CopyWebpackPlugin([{
      from: resolve(__dirname, 'index.html'),
      to: resolve(__dirname, 'dist', 'index.html')
    },
      {
        from: resolve(__dirname, './static'),
        to: resolve(__dirname, 'dist', './static'),
        ignore: ['.*']
      }
    ]),
    new HtmlWebpackPlugin({
      title: 'Goat Web Template',
      filename: resolve(__dirname, './dist/index.html'),
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
      sourceMap: false,
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
    })
  ]
})

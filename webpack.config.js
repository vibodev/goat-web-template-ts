const {  resolve } = require('path')
const os = require('os')
const webpack = require('webpack')
// const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HappyPack = require('happypack');
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  mode: 'production', // development 或 production
  // 入口文件
  entry: ['./src/index'],
  output: {
    // 把所有依赖的模块合并输出到一个 main.js 文件
    filename: '[name].bundle.js',
    // 输出文件都放到 dist 目录下
    path: resolve(__dirname, './dist')
  // 指定存放 JavaScript 文件的 CDN 目录 URL
  // publicPath: ''
  },
  resolve: {
    // 优化：缩小搜索范围
    modules: [
      resolve('src'),
      resolve('node_modules')
    ],
    // 优化：别名
    alias: {
      // 'vue$': 'vue/dist/vue.common.js',
      // 'assets':resolve('src/assets'),
    },
    // 先尝试 ts 后缀的 TypeScript 源码文件
    extensions: ['.ts', '.js']
  },
  devServer: {
    // contentBase: './dist',
    contentBase: false,
    inline: true,
    // hot: true,
    compress: true
  },
  module: {
    // 不参与编译
    // noParse: /node_modules\/(element-ui\.js)/,
    rules: [{
      test: /\.(woff|svg|eot|ttf)\??.*$/,
      include: [resolve(__dirname, 'src/assets')],
      use: 'happypack/loader?id=url'
    },
      {
        test: /\.css$/,
        use: 'happypack/loader?id=css'
      },
      {
        test: /\.less$/,
        // 必须指定，不然会出现 exports is not defined
        include: [resolve(__dirname, 'src')],
        use: 'happypack/loader?id=less'
      },
      {
        test: /\.ts$/,
        // 必须指定，不然会出现 exports is not defined
        include: [resolve(__dirname, 'src')],
        // 排除
        exclude: [
          resolve(__dirname, 'node_modules'),
          resolve(__dirname, 'bower_modules')
        ],
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  // target: 'electron-renderer',
  // 输出 source-map 方便直接调试 ES6 源码
  devtool: 'source-map',
  plugins: [
    // 清理目录
    // new CleanWebpackPlugin(['dist']),
    //
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
    // 优化：HappyPack多核利用1
    getHappyLodaer('url',['url']),
    getHappyLodaer('css',['style','css']),
    getHappyLodaer('less',['style','css','less']),
    //优化：增强代码代码压缩工具
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS:{
        output: {
          comments: false
        },
        compress: {
          warnings: false
        }
      }
    })
  ]
}
// 优化：HappyPack多核利用2
function getHappyLodaer(id,loaders){
  return new HappyPack({
    id: id,
    threads: os.cpus().length,
    loaders: loaders.map((name)=>name+'-loader')
  })
}
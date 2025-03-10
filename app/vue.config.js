const CompressionWebpackPlugin = require('compression-webpack-plugin');
const fs = require('node:fs')
const path = require('node:path')

module.exports = {
  productionSourceMap: false,
  transpileDependencies: ['element-ui', 'ele-admin', 'vue-i18n'],
  chainWebpack: (config) => {
    config.plugins.delete('prefetch');
    if (process.env.NODE_ENV !== 'development') {
      // 对超过10kb的文件gzip压缩
      config.plugin('compressionPlugin').use(new CompressionWebpackPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html)$/,
        threshold: 10240,
        minRatio: 0.8
      }));
    }
  },
  devServer: {
    historyApiFallback: true,
    public: '127.0.0.1:8082'
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          outputStyle: 'expanded'
        }
      }
    }
  }
}

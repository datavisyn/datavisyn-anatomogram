const webpack = require('webpack');
const path = require('path');

const pkg = require('./package.json');
const year = (new Date()).getFullYear();
const banner = '/*! ' + (pkg.title || pkg.name) + ' - v' + pkg.version + ' - ' + year + '\n' +
  (pkg.homepage ? '* ' + pkg.homepage + '\n' : '') +
  '* Copyright (c) ' + year + ' ' + pkg.author.name + ';' +
  ' Licensed ' + pkg.license + '*/\n';

module.exports = function (env) {
  const isProduction = env === 'prod';
  const base = {
    entry: {
      anatomogram: [path.resolve(__dirname, 'src/index.ts')],
      anatomogram_react: [path.resolve(__dirname, 'src/react.tsx')]
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '',
      filename: '[name].js',
      libraryTarget: 'umd',
      library: ['datavisyn', 'anatomogram']
    },
    module: {
      loaders: [
        {test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'},
        {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
        {test: /\.json$/, loader: 'json-loader'},
        {
          test: /\.(png|jpg)$/,
          loader: 'url-loader',
          query: {
            limit: 10000 //inline <= 10kb
          }
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader',
          query: {
            limit: 10000, //inline <= 10kb
            mimetype: 'application/font-woff'
          }
        },
        {
          test: /\.svg(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader',
          query: {
            limit: 10000, //inline <= 10kb
            mimetype: 'image/svg+xml'
          }
        },
        {test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader'}]
    },
    resolve: {
      extensions: ['.webpack.js', '.web.js', '.js', '.ts', '.tsx'],

      modules: [path.resolve(__dirname, 'src'), 'node_modules', path.resolve(__dirname, '../')]
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: banner,
        raw: true
      }),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
        }
      })
    ],
    devServer: {
      contentBase: path.resolve(__dirname, 'build')
    },
    devtool: isProduction ? 'cheap-module-source-map' : 'source-map'
  };
  return base;
};

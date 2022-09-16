const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const path = require('path'); // указание пути

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // плагин для очищения dist

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

// функция оптимизации для product
const optimization = () => {
  const config = {
    splitChunks: {
      // оптимизация загрузки библиотек,если разные точки входа будут иметь одинаковые библиотеки
      chunks: 'all',
    },
  };

  if (isProd) {
    config.minimizer = [
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,

          options: {
            encodeOptions: {}, // Your options for `squoosh`
          },
        },
      }),
    ];
  }
  return config;
};

module.exports = {
  entry: {
    main: ['@babel/polyfill', './src/main.js'], // точка старта
  },
  output: {
    path: path.resolve(__dirname, './dist/src'),
    filename: '[name].[contenthash].js', // на выходе получаем main.js с хешем
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.json'], // для понимания форматов,чтобы не писать расширения в ипорте
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // типы файлов,которые необходимы для картинок
        type: 'asset/resource',
      },
      {
        test: /\.scss$/i,
        use: [
          // Создание стилей в js
          isProd // с помощью флага мы проверяем его и если есть,то создаем css для product, если нет,то стили пишутся в js
            ? { loader: MiniCssExtractPlugin.loader, options: {} }
            : 'style-loader',
          // Перевод css в js
          'css-loader',
          // Компиляция scss to css
          'sass-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  optimization: optimization(),
  plugins: [
    new HtmlWebpackPlugin({
      // плагин для создания html
      template: './src/index.html',
      minify: { collapseWhitespace: isProd },
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash].css',
    }),
  ],
  devServer: {
    historyApiFallback: true,
    hot: true, // чтобы не перезагружать всю страницу а модулями
  },
};

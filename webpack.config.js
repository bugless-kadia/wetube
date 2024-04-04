const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: './src/client/js/main.js', // 변경하고자 하는 파일
  mode: 'development',
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/style.css',
    }),
  ],
  output: {
    filename: 'js/main.js',
    path: path.resolve(__dirname, 'assets'), // 전환된 내용을 저장할 폴더(절대경로)
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/, // 모든 javascript 파일들
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
};

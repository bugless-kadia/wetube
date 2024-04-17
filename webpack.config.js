const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const BASE_JS = './src/client/js/';

module.exports = {
  entry: {
    main: BASE_JS + 'main.js',
    videoPlayer: BASE_JS + 'videoPlayer.js',
    recorder: BASE_JS + 'recorder.js',
    commentSection: BASE_JS + 'commentSection.js',
  },
  mode: 'development',
  watch: true, // assets 자동 재실행
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/style.css',
    }),
  ],
  output: {
    filename: 'js/[name].js', // entry에 있는 이름을 가져감
    path: path.resolve(__dirname, 'assets'), // 전환된 내용을 저장할 폴더(파일까지의 전체 경로)
    clean: true, // output folder 폴더 청소
  },
  module: {
    rules: [
      {
        test: /\.js$/,
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

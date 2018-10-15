const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const paths = {
  DIST: path.resolve(__dirname, "dist"),
  SRC: path.resolve(__dirname, "src"),
  JS: path.resolve(__dirname, "src/js")
};

module.exports = {
  entry: path.join(paths.JS, "app.js"),
  output: {
    path: paths.DIST,
    filename: "app.bundle.js"
  },
  devServer: {
    contentBase: "./"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, "index.html")
    }),
    new ExtractTextPlugin({
      filename: "style.bundle.css",
      disable: false,
      allChunks: true
    })
  ],
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "postcss-loader", "sass-loader"],
          publicPath: path.join(paths.SRC, "./sass")
        })
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: ["file-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx", "css", "sass"]
  }
};

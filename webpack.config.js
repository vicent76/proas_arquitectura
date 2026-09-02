const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function (env = {}) {
  const pack = require("./package.json");

  const production = env.production === true || env.production === "true";
  const asmodule = env.module === true || env.module === "true";
  const standalone = env.standalone === true || env.standalone === "true";

  const config = {
    mode: production ? "production" : "development",

    entry: {
      myapp: "./sources/myapp.js"
    },

    output: {
      path: path.resolve(__dirname, "codebase"),
      publicPath: "/codebase/",
      filename: "[name].js",
      chunkFilename: "[name].bundle.js",
      clean: true,
      assetModuleFilename: "assets/[name][ext]"
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(svg|png|jpg|jpeg|gif)$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 25000
            }
          }
        },
        {
          test: /\.(less|css)$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "less-loader"
          ]
        }
      ]
    },

    stats: "minimal",

    resolve: {
      extensions: [".js"],
      modules: [
        path.resolve(__dirname, "sources"),
        "node_modules"
      ],
      alias: {
        "jet-views": path.resolve(__dirname, "sources/views"),
        "jet-locales": path.resolve(__dirname, "sources/locales")
      }
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css"
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(pack.version),
        APPNAME: JSON.stringify(pack.name),
        PRODUCTION: JSON.stringify(production),
        BUILD_AS_MODULE: JSON.stringify(asmodule || standalone)
      })
    ],

    devServer: {
      static: {
        directory: __dirname
      },
      devMiddleware: {
        publicPath: "/codebase/",
        stats: "errors-only"
      },
      port: 8080,
      open: true,
      hot: true
    }
  };

  if (!production) {
    config.devtool = "inline-source-map";
  }

  if (asmodule) {
    if (!standalone) {
      config.externals = ["webix-jet"];
    }

    const sub = standalone ? "full" : "module";

    config.output.library = {
      name: pack.name.replace(/[^a-z0-9]/gi, ""),
      type: "umd"
    };

    config.output.globalObject = "this";
    config.output.path = path.join(__dirname, "dist", sub);
    config.output.publicPath = "/dist/" + sub + "/";
  }

  return config;
};
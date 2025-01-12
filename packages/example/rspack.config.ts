/// <reference types="./script/global.d.ts" />
import type { Configuration } from "@rspack/cli";
import { default as HtmlPlugin } from "@rspack/plugin-html";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";

const isDev = process.env.NODE_ENV === "development";
const core = path.resolve(__dirname, "../core/src");
const delta = path.resolve(__dirname, "../delta/src");
const react = path.resolve(__dirname, "../react/src");
const utils = path.resolve(__dirname, "../utils/src");
const plugin = path.resolve(__dirname, "../plugin/src");

/**
 * @type {import("@rspack/cli").Configuration}
 * @link https://www.rspack.dev/
 */
const config: Configuration = {
  context: __dirname,
  entry: {
    index: "./src/index.tsx",
  },
  plugins: [
    new CopyPlugin([{ from: "./public", to: "./" }]),
    new HtmlPlugin({
      filename: "index.html",
      template: "./public/index.html",
    }),
  ],
  resolve: {
    alias: {
      "block-kit-utils/dist/es": utils,
      "block-kit-core": core,
      "block-kit-delta": delta,
      "block-kit-react": react,
      "block-kit-utils": utils,
      "block-kit-plugin": plugin,
    },
  },
  builtins: {
    define: {
      "__DEV__": JSON.stringify(isDev),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.PUBLIC_URL": JSON.stringify("."),
    },
    pluginImport: [
      {
        libraryName: "@arco-design/web-react",
        customName: "@arco-design/web-react/es/{{ member }}",
        style: true,
      },
      {
        libraryName: "@arco-design/web-react/icon",
        customName: "@arco-design/web-react/icon/react-icon/{{ member }}",
        style: false,
      },
    ],
  },
  module: {
    // https://www.rspack.dev/zh/config/module#rule
    rules: [
      { test: /\.svg$/, type: "asset" },
      {
        test: /.scss$/,
        oneOf: [
          {
            resource: /(module|m)\.scss$/,
            use: "sass-loader",
            type: "css/module",
          },
          {
            use: "sass-loader",
            type: "css",
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                importLoaders: true,
                localIdentName: "[name]__[hash:base64:5]",
              },
            },
          },
        ],
        type: "css",
      },
    ],
  },
  target: isDev ? undefined : "es5",
  devtool: isDev ? "source-map" : false,
  output: {
    clean: true,
    chunkLoading: "jsonp",
    chunkFormat: "array-push",
    publicPath: isDev ? "" : "./",
    path: path.resolve(__dirname, "build"),
    filename: isDev ? "[name].bundle.js" : "[name].[contenthash].js",
    chunkFilename: isDev ? "[name].chunk.js" : "[name].[contenthash].js",
    assetModuleFilename: isDev ? "[name].[ext]" : "[name].[contenthash].[ext]",
  },
};

export default config;

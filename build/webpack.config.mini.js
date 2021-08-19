const path = require("path");
const merge = require("webpack-merge");
const MiniProgramPlugin = require("./loader/mini-program-webpack-loader/src").plugin;
const EditEmit = require("./plugin/edit-emit");
const CopyWebpackPlugin = require("copy-webpack-plugin");
//查看打包大小
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const { ENTER_ENV_MAP } = require("./webpack.project.config");
const BUILD_ENV = process.env.BUILD_ENV;
const resolve = (file) => path.resolve(__dirname, "../", file);
global.context = resolve("src");
const baseConfig = require("./webpack.config.base");
const targetDirectory = `./dist/mini-programs-cli/${ENTER_ENV_MAP[BUILD_ENV]}`;

const config = {
  context: global.context,
  entry: resolve("src/app.json"),
  output: {
    path: resolve(targetDirectory),
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: resolve("src/sitemap.json"),
        to: resolve(`${targetDirectory}/sitemap.json`),
      }
    ]),
    new MiniProgramPlugin({
      extfile: false,
      route: resolve("src/router/route.json"),
    }),
  ],
};

// 生产模式下加入EditEmit插件，清楚app.json内不需要的数据字段
if (process.env.BUILD_ENV === "prod") {
  config.plugins.push(new EditEmit());
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = merge(baseConfig, config);

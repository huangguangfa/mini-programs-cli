const webpack = require("webpack");
const baseResolve = require("./webpack.config.base.resolve");
const baseLoaders = require("./webpack.config.base.loaders");
const CompileContentReplace = require('./plugin/compileContentReplace/index');
module.exports = {
    mode: "development",
    target: "node",
    devtool: false,
    watchOptions: {
        ignored: /node_modules|dist/,
        poll: 1000,
    },
    resolve: baseResolve,
    module: { rules: baseLoaders },
    optimization: {
        // minimize: false,
        // 始终开启压缩，以保证在开发模式可以预览
        concatenateModules: false,
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: "commons",
                    chunks: "initial",
                    minChunks: 2,
                },
            },
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(process.env.NODE_ENV === "production"),
        }),
        // 引入全局变量$api
        new webpack.ProvidePlugin({
            $api: ["@/api/index.js", "default"],
        }),
        new CompileContentReplace({
            rules:[
                {
                    fileName:'commons.js',
                    regexp:/try\s*{\s*regeneratorRuntime\s*=/g,
                    replacement:'try{var regeneratorRuntime=regeneratorRuntime||{};regeneratorRuntime='
                }
            ]
        })
    ],
};

const path = require("path");
const nodeFileEval = require("node-file-eval");
const { PROJECT_CONFIG } = require("./webpack.project.config");
var ENVINFO = nodeFileEval.sync(PROJECT_CONFIG.projectEnvPath);
const fileLoader = (name) => ({
    loader: "file-loader",
    options: {
        publicPath: "",
        context: global.context || path.resolve(__dirname, "../src"),
        name,
    },
});

let imgPath = ENVINFO.staticPath || "";

module.exports = [
    {
        test: /\.js$/,
        exclude: path.resolve(__dirname, "../node_modules"),
        use: ["cache-loader", "babel-loader"],
    },
    {
        test: /.wxml/,
        use: [
            fileLoader("[path][name].[ext]"),
            path.resolve(__dirname, "./loader/mini-program-webpack-loader/src/index.js"),
        ],
    },
    {
        test: /\.wxss$/,
        use: [
            fileLoader("[path][name].[ext]"),
            path.resolve(__dirname, "./loader/mini-program-webpack-loader/src/index.js"),
        ],
    },
    {
        test: /\.less$/,
        use: [
            fileLoader("[path][name].wxss"),
            "less-loader",
            {
                loader: "style-resources-loader",
                options: {
                    patterns: path.resolve(__dirname, "../src/style/variable.less"),
                },
            },
            {
                loader: "string-replace-loader",
                options: {
                    multiple: [
                        {
                            search: /(@IMGPATH|@imgPath)/g,
                            replace: imgPath || "",
                        },
                    ],
                },
            },
        ],
    },
    {
        test: /project\.config\.json$/,
        type: "javascript/auto",
        use: [
            fileLoader("[path][name].[ext]"),
            {
                loader: "string-replace-loader",
                options: {
                    multiple: [
                        {
                            search: /({APPID})/g,
                            replace: ENVINFO.appId,
                        },
                        {
                            search: /({ENVNAME})/g,
                            replace: ENVINFO.name,
                        },
                    ],
                },
            },
        ],
    },
    {
        test: /.wxs$/,
        use: [
            fileLoader("[path][name].[ext]"),
            "babel-loader",
            path.resolve(__dirname, "./loader/mini-program-webpack-loader/src/index.js"),
        ],
    },
    {
        test: /\.json/,
        exclude: [
            path.resolve(__dirname, "../src/router/route.json"),
            path.resolve(__dirname, "../src/project.config.json"),
            path.resolve(__dirname, "../src/api/api.json"),
        ],
        type: "javascript/auto",
        use: [fileLoader("[path][name].[ext]")],
    },
    {
        test: /\.(png|jpg|gif)$/,
        include: /src/,
        use: fileLoader("[path][name].[ext]"),
    },
];

const path = require("path");
const resolve = (file) => path.resolve(__dirname, "../", file);

// 编译环境Map
const ENTER_ENV_MAP = {
  dev: "dev",
  prod: "prod",
  pre: "pre",
  test: "test",
};
module.exports.ENTER_ENV_MAP = ENTER_ENV_MAP;

// 项目配置地址
module.exports.PROJECT_CONFIG = {
  projectEnvPath: resolve(
    `src/env/env.${ENTER_ENV_MAP[process.env.BUILD_ENV]}.js`
  ),
};

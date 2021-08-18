const { PROJECT_CONFIG } = require("./webpack.project.config");
const path = require("path");

const resolve = (p) => path.resolve(__dirname, "../", p);
module.exports = {
  alias: {
    "@": resolve("src"),
    "@envPath": PROJECT_CONFIG.projectEnvPath,
    "@env": path.resolve("src/env/index.js"),
    "@api": resolve("src/api"),
    "@lib": resolve("src/lib"),
    "@omi": path.resolve("src/lib/omi"),
    "@utils": resolve("src/utils"),
    "@components": path.resolve("src/components"),
    "@business": path.resolve("src/components/business"),
    "@vant": path.resolve("src/components/vant"),
  },
};

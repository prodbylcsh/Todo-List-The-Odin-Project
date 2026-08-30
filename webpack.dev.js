// webpack.config.js
import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
    mode: "development",
    devtool: "eval-source-map", //adds source map
    devServer: {
        watchFiles: ["./src/index.html"],
    },
});
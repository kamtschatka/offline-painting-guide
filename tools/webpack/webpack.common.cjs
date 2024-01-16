const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "..", "source");

const fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

module.exports = {
    entry: {
        popup: path.join(srcDir, "popup", "popup.ts"),
        printPage: path.join(srcDir, "printPage", "printpage.ts"),
        background: path.join(srcDir, "background", "background.ts"),
        contentscript: path.join(srcDir, "contentscript", "contentscript.ts"),
    },
    output: {
        path: path.join(__dirname, "../../dist/js/source"),
        filename: (pathData) => {
            return `${pathData.chunk.name}/[name].js`;
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
                loader: "file-loader",
                options: {
                    name: "../assets/[contenthash].[ext]",
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        modules: [path.resolve("./node_modules"), path.resolve("./source")],
        extensions: [".ts", ".js"],
    }
};
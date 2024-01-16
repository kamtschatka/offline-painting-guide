import * as fs from "fs";
import ncp from "ncp";
import * as util from "util";
import create from "archiver";
import { extractVariables, VARIABLES } from "./shared.js";

try {
    await fs.mkdirSync("./dist/packaging");
} catch (err) {

}

let promisifiedNcp = util.promisify(ncp);
await promisifiedNcp("./images", "./dist/packaging/images");
await promisifiedNcp("./printPage", "./dist/packaging/printPage");
await promisifiedNcp("./dist/js/source", "./dist/packaging/source");
const variables = extractVariables();
let version = variables[VARIABLES.VERSION]!;
await updateManifest(version);
await fs.copyFileSync("./rules.json", "./dist/packaging/rules.json");
await fs.copyFileSync("./source/popup/popup.html", "./dist/packaging/source/popup/popup.html");
fs.mkdirSync("./dist/lib", { recursive: true });
await createZipFile("./dist/packaging", `./dist/lib/extension ${version}.zip`);

/**
 * @param sourceDir the folder to compress
 * @param outPath where to store the compressed file
 * @returns
 */
function createZipFile(sourceDir: string, outPath: string): Promise<void> {
    const archive = create('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);

    return new Promise((resolve, reject) => {
        archive
            .directory(sourceDir, false)
            .on('error', err => reject(err))
            .pipe(stream)
        ;

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

async function updateManifest(version: string) {
    let data = fs.readFileSync("./manifest.json", "utf8");
    data = data.replace(`<version>`, version);
    fs.writeFileSync("./dist/packaging/manifest.json", data);
}
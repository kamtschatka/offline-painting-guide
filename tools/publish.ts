import chromeWebstoreUpload from "chrome-webstore-upload";
import * as fs from "fs";
import { extractVariables, VARIABLES } from "./shared.js";

const variables = extractVariables();
const version = variables[VARIABLES.VERSION]!;
const store = chromeWebstoreUpload({
    extensionId: variables[VARIABLES.EXTENSION_ID]!,
    clientId: variables[VARIABLES.CLIENT_ID]!,
    clientSecret: variables[VARIABLES.CLIENT_SECRET]!,
    refreshToken: variables[VARIABLES.REFRESH_TOKEN]!
});
const extension = fs.createReadStream(`./dist/lib/extension ${version}.zip`);

const token = await store.fetchToken();
await store.uploadExisting(extension, token);
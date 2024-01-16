export function extractVariables(): Partial<EnvironmentVariables> {
    let version = "1.0.0";

    const values:Partial<EnvironmentVariables> = {};

    for (const arg of process.argv) {
        const firstIndex = arg.indexOf("=");
        if (firstIndex > -1) {
            const key = arg.substring(0, firstIndex);
            const value = arg.substring(firstIndex + 1);

            if (key in VARIABLES) {
                console.log(`Found variable ${key} with value ${value}`);
                values[key as VARIABLES] = value;
            }
        }
    }

    if (!values[VARIABLES.VERSION]) {
        values[VARIABLES.VERSION] = version;
    }

    values[VARIABLES.VERSION] = values[VARIABLES.VERSION]?.replace("release_", "");

    return values;
}

export type EnvironmentVariables = {
    [key in VARIABLES]: string;
};

export enum VARIABLES {
    EXTENSION_ID = "EXTENSION_ID",
    CLIENT_ID = "CLIENT_ID",
    CLIENT_SECRET = "CLIENT_SECRET",
    REFRESH_TOKEN = "REFRESH_TOKEN",
    VERSION = "VERSION",
}
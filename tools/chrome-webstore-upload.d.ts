declare module "chrome-webstore-upload" {
    function chromeWebstoreUpload(config: {
        extensionId: string,
        clientSecret: string,
        clientId: string,
        refreshToken: string
    }): Store;

    export type Store = {
        uploadExisting(file: fs.ReadStream, token?: string): Promise<void>;
        publish(target?: string, token?: string): Promise<void>;
        get(projection?: string, token?: string): Promise<void>;
        fetchToken(): Promise<string>;
    };

    export default chromeWebstoreUpload;
}
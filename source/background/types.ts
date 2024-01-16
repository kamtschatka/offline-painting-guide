export type PaintGuideInformation = {
    methods: PaintingMethods;
};

export type PaintingMethods = {
    [key in METHOD]: PaintingMethodInformation[];
}

export type PaintingMethodInformation = {
    name: string;
    swatchImage: string;
    urlParam: string;
    paints: Paint[];
}

export type Paint = {
    productId: string;
    imageName: string;
}

export const enum METHOD {
    CLASSIC = "classic",
    CONTRAST = "contrast"
}

export type Message = {
    [T in MessageType]: { type: T, content: MessageData<T> }
}[MessageType];

export type MessageData<T extends MessageType> = T extends MESSAGE_TYPE.START_DOWNLOAD ? StartDownloadContent :
    T extends MESSAGE_TYPE.PAINT_GUIDE ? PaintGuideContent :
        T extends MESSAGE_TYPE.IMAGE_DOWNLOAD ? ImageDownloadContent :
            T extends MESSAGE_TYPE.PAINT_GUIDE_RESPONSE ? PaintGuideContent :
                T extends MESSAGE_TYPE.GET_PAINT_GUIDE ? GetPaintGuideContent : never;

export type StartDownloadContent = {}
export type PaintGuideContent = {
    title: string,
    config: string,
    images: string[]
}

export type ImageDownloadContent = {
    title: string,
    url: string
}

export type GetPaintGuideContent = {}

export type StoreFileContent = {
    blobURL: string,
    title: string,
    filename: string
}

export type MessageType = MESSAGE_TYPE.START_DOWNLOAD | MESSAGE_TYPE.PAINT_GUIDE | MESSAGE_TYPE.IMAGE_DOWNLOAD | MESSAGE_TYPE.GET_PAINT_GUIDE | MESSAGE_TYPE.STORE_FILE | MESSAGE_TYPE.PAINT_GUIDE_RESPONSE;

export const enum MESSAGE_TYPE {
    START_DOWNLOAD = "startDownload",
    PAINT_GUIDE = "paintGuide",
    IMAGE_DOWNLOAD = "imageDownload",
    GET_PAINT_GUIDE = "getPaintGuide",
    STORE_FILE = "storeFile",
    PAINT_GUIDE_RESPONSE = "PaintGuideResponse"
}

export type DownloadItem = {
    filename: string,
    url: string
};
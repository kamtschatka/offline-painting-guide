import { PaintGuideInformation } from "../background/types";

extractData();

function extractData() {
    const heading = document.title;

    if (!heading) {
        console.log("Did not find the title for this page, skipping download of the 360° images");
    } else {
        const title = heading.trim();
        const images: string[] = collectImages(title);
        collectPaintingGuide(title, images);
    }
}

function collectImages(title: string): string[] {
    let uniqueImages = new Set<string>();
    collectNormalImages(uniqueImages);
    collect360Images(uniqueImages);

    reportImages(title, uniqueImages);

    return Array.from(uniqueImages);
}

function reportImages(title: string, uniqueImages: Set<string>): void {
    for (let imageUrl of uniqueImages) {
        sendImageMessage(title, imageUrl);
    }
}

type ImageList = {
    url?: string;
    images360?: Array<Array<{ url: string }>>;
}

function getImagesList(): ImageList[] {
    return JSON.parse(document.getElementById("__NEXT_DATA__").innerHTML).props.pageProps.pageLayout.renderZones[0].components[0].fields.components[0].fields.product.images;
}

function collectNormalImages(uniqueImages: Set<string>): void {
    let images = getImagesList();

    //Report normal images on the page
    for (let image of images) {
        const imageUrl = image.url;
        if (imageUrl) {
            if (imageUrl && imageUrl.indexOf("threeSixty") < 0) {
                uniqueImages.add(new URL(imageUrl, location.origin).href);
            }
        }
    }
}

function collect360Images(uniqueImages: Set<string>): void {
    let images = getImagesList();
    let returnedImages = [];

    for (let image of images) {
        if (image.images360) {
            for (let image360Array of image.images360) {
                for (let image360 of image360Array) {
                    uniqueImages.add(new URL(image360.url, location.origin).href);
                }
            }
        }
    }
}

function sendImageMessage(title: string, url: string): void {
    chrome.runtime.sendMessage({
        type: "imageDownload",
        content: {
            title: title,
            url: url
        }
    });
}

function sendPaintGuideMessage(title: string, images: string[], config: PaintGuideInformation): void {
    let message = {
        type: "paintGuide",
        content: {
            title: title,
            config,
            images
        }
    };
    console.log("sending message: ", message);
    chrome.runtime.sendMessage(message);
}

function collectPaintingGuide(title: string, images: string[]): void {
    let paintGuideInformation = extractPaintingGuide();
    sendPaintGuideMessage(title, images, paintGuideInformation);
}

function extractPaintingGuide(): PaintGuideInformation {
    // const content = document.body.innerHTML;
    // const split = content.split('"product.paintingGuide": [');
    // if (split.length < 2) {
    //     throw new Error("product.paintingGuide not contained on the page");
    // }
    // const endIndex = split[1].indexOf("\"record.id\":");
    // if (endIndex < 0) {
    //     throw new Error("did not find closing \"record.id\": for product.paintingGuide JSON");
    // }
    // const jsonValues = split[1].substring(0, endIndex);
    // const end = jsonValues.substring(0, jsonValues.lastIndexOf("]"));
    // return JSON.parse(end);
    return {
        methods: {
            "classic": [],
            "contrast": []
        }
    };
}

type ImageInformation = {
    threeSixtyRows?: number;
    threeSixtyColumns: number;
    threeSixtyFramesPath: string;
};

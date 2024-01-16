import { DownloadItem, ImageDownloadContent, Message, MESSAGE_TYPE, PaintGuideContent, StoreFileContent } from "./types";

const queue: DownloadItem[] = [];
let lastPaintingGuideContent: PaintGuideContent;
let downloadRunning = false;
let openTab;

chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
    switch (message.type) {
        case MESSAGE_TYPE.START_DOWNLOAD:
            await handleStartDownload();
            break;
        case MESSAGE_TYPE.PAINT_GUIDE:
            await handlePaintGuide(message.content);
            break;
        case MESSAGE_TYPE.IMAGE_DOWNLOAD:
            handleImageDownload(message.content);
            break;
        case MESSAGE_TYPE.GET_PAINT_GUIDE:
            handleGetPaintGuide(sendResponse);
            break;
        case MESSAGE_TYPE.STORE_FILE:
            await handleFileStoring(message.content);
            break;
    }
});

async function handleFileStoring(content: StoreFileContent) {
    await chrome.downloads.download({
        url: content.blobURL,
        filename: `Games-Workshop/${sanitizeFileName(content.title)}/${sanitizeFileName(content.filename)}`,
        conflictAction: "overwrite"
    });
    await chrome.tabs.remove(openTab.id);
}

function handleGetPaintGuide(sendResponse) {
    sendResponse({
        type: "PaintGuideResponse",
        content: lastPaintingGuideContent
    });
}

async function handlePaintGuide(content: PaintGuideContent) {
    lastPaintingGuideContent = content;
    openTab = await chrome.tabs.create({url: chrome.runtime.getURL("/printPage/testpage.html")});
}

function handleImageDownload(content: ImageDownloadContent) {
    let url = content.url;
    let title = content.title;
    let lastSlashIndex = url.lastIndexOf("/");
    let filename = url.substring(lastSlashIndex + 1);
    let foldername = "";
    if (url.indexOf("threeSixty") > 0) {
        let urlWithoutName = url.substring(0, lastSlashIndex);
        foldername = urlWithoutName.substring(urlWithoutName.lastIndexOf("/") + 1);
        foldername = sanitizeFileName(foldername) + "/";
    }
    queue.push({ filename: `Games-Workshop/${sanitizeFileName(title)}/${foldername}${sanitizeFileName(filename)}`, url: url });
    startDownload();
}

function sanitizeFileName(filename: string): string {
    return filename.replace(/[/\\?%*:|"<>]/g, '-');
}

async function handleStartDownload() {
    let window = await chrome.windows.getCurrent();
    let [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
    if (tab.id) {
        await chrome.scripting.executeScript({
            files: ["source/contentscript/contentscript.js"],
            target: { "tabId": tab.id }
        });
    } else {
        console.log("tab.id was undefined");
    }
}

function startDownload() {
    if (downloadRunning || queue.length === 0) {
        return;
    } else {
        downloadRunning = true;
        const downloadItem = queue.pop();
        if (downloadItem) {
            console.log("trying to download: " + downloadItem)
            const withoutInvalidCharacters = downloadItem.filename;
            chrome.downloads.download(
                {
                    filename: withoutInvalidCharacters,
                    url: downloadItem.url,
                    conflictAction: "overwrite"
                }, function () {
                    console.log(chrome.runtime.lastError);
                    downloadRunning = false;
                    startDownload();
                });
        }
    }
}
import { Message, MESSAGE_TYPE, METHOD, Paint, PaintGuideInformation, PaintingMethodInformation } from "../background/types";

declare var $: any;
declare var html2pdf: any;

let waitingImages = 0;
let title;

function requestPaintGuide() {
    chrome.runtime.sendMessage({
        type: "getPaintGuide"
    }, (response: Message) => {
        if (createTable(response)) {
            loadCanvasImages();
        }
    });
}

function loadCanvasImages() {
    const canvases = document.getElementsByTagName("canvas");
    for (const canvas of canvases) {
        loadCanvasImage(canvas);
    }
}

function loadCanvasImage(canvas: HTMLCanvasElement) {
    waitingImages++;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = function () {
        const ratio = img.width / canvas.width;
        canvas.height = img.height / ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        reduceWaitingImagesAndTriggerExport();
    };
    img.onerror = function () {
        reduceWaitingImagesAndTriggerExport();
    };
    img.src = canvas.getAttribute("data-imageUrl");
}

function reduceWaitingImagesAndTriggerExport() {
    waitingImages--;
    if (waitingImages == 0) {
        saveToPdf();
    }
}

function saveToPdf() {
    const options = {
        html2canvas: { useCORS: true },
    };
    html2pdf().set(options).from(document.body).toPdf().output('blob').then((blob: Blob) => {
        storeFile(blob);
    });
}

function storeFile(blob: Blob) {
    const cleanedTitle = title.replace(/[/\\?%*:|"<>]/g, '-');
    const filename = `Painting Guide - ${cleanedTitle}.pdf`;
    chrome.runtime.sendMessage({
        type: "storeFile",
        content: {
            blobURL: URL.createObjectURL(blob),
            title: title,
            filename: filename
        }
    });
}

window.addEventListener('load', () => {
    requestPaintGuide()
});

function createTable(message: Message): boolean {
    if (!message || !message.content || message.type !== MESSAGE_TYPE.PAINT_GUIDE_RESPONSE) {
        return false;
    }
    const paintingGuideInformation: PaintGuideInformation = message.content.config as unknown as PaintGuideInformation;
    title = message.content.title;
    const images = message.content.images;

    const body = $("body");
    body.append(`<h1>${title}</h1>`);
    const table = $(`<table><tr><td><canvas data-imageUrl="${images[0]}" width="300px"></td><td><canvas data-imageUrl="${images[1]}" width="300px"></td></tr></table>`);
    body.append(table);
    appendPaintingMethod(paintingGuideInformation.methods[METHOD.CLASSIC], "Classic Method");
    appendPaintingMethod(paintingGuideInformation.methods[METHOD.CONTRAST], "Contrast Method");
    return true;
}

function appendPaintingMethod(allPaintingMethodInformation: PaintingMethodInformation[], name: string): void {
    const body = $("body");
    body.append(`<h2>${name}</h2>`);
    const table = $(`<table class="outertable">`);
    const tr = $(`<tr class="mytr"><td class="mytd"></td><td class="mytd"></td><td class="mytd"><b>Battle Ready</b></td><td class="mytd"><b>Tabletop Ready</b></td>`);
    table.append(tr);
    for (const singlePaintingMethodInformation of allPaintingMethodInformation) {
        const tr = $("<tr class=\"mytr\">");
        tr.append(`<td style="padding: 10px" class="mytd"><b>${singlePaintingMethodInformation.name}</b></td>`);

        tr.append(`<td class="mytd"><canvas data-imageUrl="${singlePaintingMethodInformation.swatchImage}" width="110px"/></td>`);

        appendPaintingStyleTables(tr, singlePaintingMethodInformation);
        table.append(tr);
    }
    body.append(table);
}

function appendPaintingStyleTables(parent, paintingMethodInformation: PaintingMethodInformation): void {
    const split = paintingMethodInformation.urlParam.split("-");
    const battleReadyPaintCount = split[0].split(",").length;

    const battleReadyPaints = paintingMethodInformation.paints.slice(0, battleReadyPaintCount);
    const tableTopReadyPaints = paintingMethodInformation.paints.slice(battleReadyPaintCount);
    appendPaintingStyleTable(parent, battleReadyPaints);
    appendPaintingStyleTable(parent, tableTopReadyPaints);
}

function appendPaintingStyleTable(parent, paints: Paint[]): void {
    const td = $(`<td valign="top" class="mytd">`);
    const table = $(`<table style="float: left" width="50px" class="innertable">`);
    td.append(table);
    const tr2 = $("<tr>");
    for (const paint of paints) {
        if (!paint.imageName) {
            continue;
        }
        tr2.append(`<td style="padding-left: 30px; padding-right: 30px"><canvas data-imageUrl="https://www.games-workshop.com/resources/catalog/product/600x620/${paint.imageName}" width="50"/></td>`);
    }
    table.append(tr2);

    const tr3 = $("<tr>");
    for (const paint of paints) {
        if (!paint.imageName) {
            continue;
        }
        table.append(`<td align="center">${extractPaintNameFromImage(paint)}</td>`);
    }
    table.append(tr3);

    parent.append(td);
}

function extractPaintNameFromImage(paint: Paint): string {
    const split = paint.imageName.replace(".svg", "").split("_");
    return split[split.length - 1].match(/([A-Z]?[^A-Z]*)/g).slice(1, -1).join(" ");
}
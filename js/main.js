const curPageNum = document.getElementById("curPageNum"),
    totPageNum = document.getElementById("totPageNum"),
    cnvReg = document.getElementById("cnvReg");
var fileName, pdf, pageNum, canvases = [];

function loadPdf(event) {
    const file = event.target.files[0];

    if (file.type != "application/pdf") {
        alert("Please check your file!");
    }
    else {
        fileName = file.name;
        fileName = fileName.substring(0, fileName.lastIndexOf("."));

        let reader = new FileReader();
        reader.onload = function (e) {
            let loadTask = pdfjsLib.getDocument(e.target.result);
            loadTask.promise.then(function (doc) {
                pdf = doc;
                renderPdf();
            }, function (error) {
                alert(error);
            });
        };
        reader.readAsDataURL(file);
    }
}

function renderPdf() {
    cnvReg.innerHTML = null;
    canvases.length = 0;

    for (let i = 0; i < pdf.numPages; i++) {
        canvases.push(document.createElement("canvas"));
        canvases[i].hidden = true;
        canvases[i].style = "width: 100%;"
        cnvReg.appendChild(canvases[i]);

        pdf.getPage(i + 1).then(function (page) {
            let vp = page.getViewport({ scale: 2 });
            canvases[i].height = vp.height;
            canvases[i].width = vp.width;

            page.render({
                canvasContext: canvases[i].getContext("2d"),
                viewport: vp
            }).promise;
        })
    }

    pageNum = 1;
    curPageNum.innerHTML = pageNum;
    totPageNum.innerHTML = pdf.numPages;
    ctrlCanvases();
}

function nextPage() {
    if (pageNum < pdf.numPages) {
        pageNum += 1;
        curPageNum.innerHTML = pageNum;
        ctrlCanvases();
    }
}

function pageBack() {
    if (pageNum > 1) {
        pageNum -= 1;
        curPageNum.innerHTML = pageNum;
        ctrlCanvases();
    }
}

function ctrlCanvases() {
    for (let i = 0; i < canvases.length; i++) {
        if (i == pageNum - 1) {
            canvases[i].hidden = false;

        }
        else canvases[i].hidden = true;
    }
}

function getImgType() {
    let imgType;
    document.getElementsByName("imgType").forEach(function (element) {
        if (element.checked) {
            imgType = element.value;
        }
    });

    return imgType;
}

function download() {
    let tmpA = document.createElement("a"),
        imgType = getImgType();

    tmpA.href = canvases[pageNum - 1].toDataURL(`image/${imgType}`, 1.0);
    tmpA.download = `${fileName}-${pageNum}.${imgType}`;
    tmpA.click();
}

function downloadAll() {
    let imgType = getImgType(),
        zip = new JSZip(),
        images = zip.folder(fileName);

    let tmpPageNum = pageNum;
    for (let i = 0; i < pdf.numPages; i++) {
        pageNum = i + 1;
        ctrlCanvases();

        images.file(`${fileName} - ${pageNum}.${imgType}`,
            canvases[i].toDataURL(`image/${imgType}`, 1.0).split(";base64,")[1],
            { base64: true });
    }
    pageNum = tmpPageNum;
    ctrlCanvases();

    zip.generateAsync({
        type: "blob"
    }).then(function (content) {
        saveAs(content, "images.zip");
    });
}
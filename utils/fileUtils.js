function getContentType(file) {
    const mime = file.mime.split("/");
    const extraData = { type: mime[0], extension: mime[1] }
    return extraData;
}

export {getContentType}
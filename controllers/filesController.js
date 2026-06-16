import { prisma } from "../lib/prisma.js"

function getContentType(file) {
    const mime = file.mime.split("/");
    const extraData = { type: mime[0], extension: mime[1] }
    return extraData;
}

async function fileListGet(req, res) {
    if (!req.user)
        return res.redirect("/auth/log-in")
    const files = await prisma.files.findMany({
        where:
            { ownerId: req.user.id },
        include: {
            owner:
            {
                select:
                    { username: true }
            }
        }
    });
    const filesWithData = files.map((file) => {
        const extraData = getContentType(file);
        return { ...file, ...extraData };
    })
    res.render("home", { files: filesWithData });
}

function newFileFormGet(req, res) {
    if (!req.user)
        return res.redirect("/")
    res.render("upload-file")
}

async function newFileFormPost(req, res) {
    if (!req.user)
        return res.redirect("/")
    let content = null;
    if (req.file.mimetype.split("/")[0] == 'text')
        content = new Buffer(req.file.buffer).toString('utf8');
    else
        content = new Buffer(req.file.buffer).toString('base64');

    try {
        const result = await prisma.files.create({
            data: {
                title: req.file.originalname,
                mime: req.file.mimetype,
                size: req.file.size,
                content: content,
                ownerId: req.user.id
            }
        });
        res.redirect("/files/new-file")
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function downloadFile(req, res) {
    const file = await prisma.files.findUnique({ where: { id: parseInt(req.params.id) } });
    const myBuffer = Buffer.from(file.content, 'base64');
    res.setHeader('Content-Disposition', `attachment; filename=${file.title}`);
    res.setHeader('Content-Type', `${file.mime}`);
    res.send(myBuffer);
}

async function getFileById(req, res) {
    const file = await prisma.files.findUnique({
        where:
            { id: parseInt(req.params.id) }, include: {
                owner:
                    { select: { username: true } }
            }
    });
    const extraData = getContentType(file);
    res.render("file-details", { file: { ...file, ...extraData } });
}


export {
    newFileFormGet,
    newFileFormPost,
    fileListGet,
    downloadFile,
    getFileById
}
import { prisma } from "../lib/prisma.js"

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
        const mime = file.mime.split("/");
        const extraData = { type: mime[0], extension: mime[1] }
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
    console.log(req.file)
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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function downloadFile(req, res) {
    const file = await prisma.files.findUnique({ where: { id: parseInt(req.params.id) } });
    const myBuffer = Buffer.from(file.content, 'base64');
    res.setHeader('Content-Disposition', `attachment; filename=${file.title}`);
    res.setHeader('Content-Type', `${file.mime}`);
    res.send(myBuffer);
}


export {
    newFileFormGet,
    newFileFormPost,
    fileListGet,
    downloadFile
}
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
        console.log(result.id, result.title)
        res.redirect("/files/new-file")
    } catch (error) {
        console.log(error);
        next(error);
    }
}


export {
    newFileFormGet,
    newFileFormPost,
    fileListGet
}
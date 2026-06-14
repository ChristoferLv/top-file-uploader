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
    res.render("home", { files: files });
}

function newFileFormGet(req, res) {
    if (!req.user)
        return res.redirect("/")
    res.render("upload-file")
}

async function newFileFormPost(req, res) {
    if (!req.user)
        return res.redirect("/")

    const imgData = new Buffer(req.file.buffer).toString('base64');
    try {
        const result = await prisma.files.create({
            data: {
                title: req.file.originalname,
                mime: req.file.mimetype,
                size: req.file.size,
                content: imgData,
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
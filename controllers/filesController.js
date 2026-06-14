import { prisma } from "../lib/prisma.js"

async function fileListGet(req, res) {
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
    console.log(files);
    res.render("home", { files: files });
}

function newFileFormGet(req, res) {
    res.render("upload-file")
}

async function newFileFormPost(req, res) {
    try {
        const result = await prisma.files.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                ownerId: req.user.id
            }
        });
        console.log(result)
        res.redirect("/")
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
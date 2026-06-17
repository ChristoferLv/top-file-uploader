import { prisma } from "../lib/prisma.js";

async function getAllFolders(req) {
    try {
        const result = await prisma.folders.findMany({ where: { ownerId: req.user.id } });
        return result;
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function createNewFolderPost(req, res) {
    if (!req.user)
        return res.redirect("/auth/log-in");

    try {
        const result = await prisma.folders.create({
            data: {
                title: req.body.name,
                ownerId: req.user.id
            }
        });
        res.redirect("/files")
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function fileListFromFolderGet(req, res) {
    if (!req.user)
        return res.redirect("/auth/log-in");

    const folder = await prisma.folders.findUnique({ where: { id: req.params.id } });
    if (folder.ownerId != parseInt(req.params.id))
        return res.redirect("/");

    const result = await prisma.files.findMany({ where: { folders: folder } });
    res.render("inside-folder", { files: result, name:folder.title });
}

export {
    createNewFolderPost,
    getAllFolders,
    fileListFromFolderGet
}
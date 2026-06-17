import { prisma } from "../lib/prisma.js";
import { getContentType } from "../utils/fileUtils.js";

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

    const folder = await prisma.folders.findUnique({ where: { id: parseInt(req.params.id) } });
    if (folder.ownerId != parseInt(req.user.id)) {
        return res.redirect("/");
    }

    const result = await prisma.files.findMany({ where: { folders: folder } });
    const filesWithData = result.map((file) => {
        const extraData = getContentType(file);
        return { ...file, ...extraData };
    });
    res.render("inside-folder", { files: filesWithData, name: folder.title, folderId: folder.id });
}

export {
    createNewFolderPost,
    getAllFolders,
    fileListFromFolderGet
}
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

    const folder = await prisma.folders.findUnique({ where: { id: parseInt(req.params.id) }, include: { share_link: { select: { link: true } } } });
    if (folder.ownerId != parseInt(req.user.id)) {
        return res.redirect("/");
    }
    console.log(folder)
    const result = await prisma.files.findMany({ where: { folders: folder } });
    const filesWithData = result.map((file) => {
        const extraData = getContentType(file);
        return { ...file, ...extraData };
    });
    res.render("inside-folder", { files: filesWithData, folder: folder, is_shared:false });
}

async function renameFolder(req, res) {
    if (!req.user)
        return res.redirect("/auth/log-in");

    const id = parseInt(req.params.id);
    const folder = await prisma.folders.findUnique({ where: { id: id } });
    if (folder.ownerId != parseInt(req.user.id)) {
        return res.redirect("/");
    }

    const result = await prisma.folders.update({ where: { id: id }, data: { title: req.body.name } })
    return res.redirect("/folder/" + id);
}

async function deleteFolder(req, res) {
    if (!req.user)
        return res.redirect("/auth/log-in");

    const id = parseInt(req.params.id);
    const folder = await prisma.folders.findUnique({ where: { id: id } });
    if (folder.ownerId != parseInt(req.user.id)) {
        return res.redirect("/");
    }

    const result = await prisma.folders.delete({ where: { id: id } });
    return res.redirect("/files");
}

async function createShareLink(req, res) {
    console.log("chamado")
    const id = parseInt(req.params.id);
    const futureDate = new Date();
    const identifier = crypto.randomUUID();
    futureDate.setDate(futureDate.getDate() + 7);
    const result = await prisma.share_links.create({
        data: {
            folderId: id,
            link: identifier,
            expires_at: futureDate,
        }
    });
    console.log(result)
    res.redirect("/folder/" + id);
}

async function fileListFromSharedFolderGet(req, res) {
    const shareLink = await prisma.share_links.findUnique({ where: { link: req.params.shareLink } });
    const folder = await prisma.folders.findUnique({ where: { id: shareLink.folderId } });

    const result = await prisma.files.findMany({ where: { folders: folder } });
    const filesWithData = result.map((file) => {
        const extraData = getContentType(file);
        return { ...file, ...extraData };
    });
    res.render("inside-folder", { files: filesWithData, folder: folder, is_shared:true, shareToken:req.params.shareLink });
}

export {
    createNewFolderPost,
    getAllFolders,
    fileListFromFolderGet,
    renameFolder,
    deleteFolder,
    createShareLink,
    fileListFromSharedFolderGet
}
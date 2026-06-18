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
    const result = await prisma.files.findMany({ where: { folders: folder } });
    const filesWithData = result.map((file) => {
        const extraData = getContentType(file);
        return { ...file, ...extraData };
    });
    res.render("inside-folder", { files: filesWithData, folder: folder, is_shared: false });
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
    const id = parseInt(req.params.id);
    const futureDate = new Date();
    const identifier = crypto.randomUUID();
    futureDate.setDate(futureDate.getDate() + parseInt(req.body.duration));
    const result = await prisma.share_links.upsert({
        create: {
            folderId: id,
            link: identifier,
            expires_at: futureDate,
        },
        update: {
            folderId: id,
            link: identifier,
            expires_at: futureDate
        },
        where: { folderId: id }
    });
    res.redirect("/folder/" + id);
}

async function deleteShareLink(req, res) {
    const id = parseInt(req.params.id);
    const folder = await prisma.folders.findUnique({ where: { id: id }, include: { share_link: true } });
    if (!folder.share_link)
        res.redirect("/folder/" + id);
    const result = await prisma.share_links.delete({ where: { id: folder.share_link.id } });
    res.redirect("/folder/" + id);
}

async function fileListFromSharedFolderGet(req, res) {
    const shareLink = await prisma.share_links.findUnique({ where: { link: req.params.shareLink } });
    if (shareLink.expires_at.getTime() < Date.now()) {
        return res.redirect("/files");
    }
    const folder = await prisma.folders.findUnique({ where: { id: shareLink.folderId } });

    const result = await prisma.files.findMany({ where: { folders: folder } });
    const filesWithData = result.map((file) => {
        const extraData = getContentType(file);
        return { ...file, ...extraData };
    });
    res.render("inside-folder", { files: filesWithData, folder: folder, is_shared: true, shareToken: req.params.shareLink });
}

export {
    createNewFolderPost,
    getAllFolders,
    fileListFromFolderGet,
    renameFolder,
    deleteFolder,
    createShareLink,
    fileListFromSharedFolderGet,
    deleteShareLink
}
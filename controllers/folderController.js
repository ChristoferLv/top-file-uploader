import { prisma } from "../lib/prisma.js";
import { getContentType } from "../utils/fileUtils.js";
import { body, validationResult } from "express-validator"
import { getAllFiles } from "./filesController.js";

const validateNewFolder = [
    body("name").trim().matches(/^[a-zA-Z0-9\s]+$/).withMessage("Folder name must contain only letters and numbers").isLength({ max: 30 }).withMessage("Maximum size for folder name is 30")
];

async function getAllFolders(req) {
    try {
        const result = await prisma.folders.findMany({ where: { ownerId: req.user.id }, orderBy: { created_at: "desc" } });
        return result;
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const createNewFolderPost = [validateNewFolder,
    async (req, res) => {
        if (!req.user)
            return res.redirect("/auth/log-in");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorsObj = {};
            errors.array().forEach(error => {
                if (error.path in errorsObj)
                    errorsObj[error.path] = `• ${errorsObj[error.path]} <br> • ${error.msg}`;
                else
                    errorsObj[error.path] = error.msg;
            });
            const folders = await getAllFolders(req);
            const files = await getAllFiles(req);
            const filesWithData = files.map((file) => {
                const extraData = getContentType(file);
                return { ...file, ...extraData };
            });
            return res.status(400).render("home", {
                files: filesWithData,
                folders: folders,
                folderError: errorsObj,
                recoveredName: req.body.name
            });
        }
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
]

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

const renameFolder = [
    validateNewFolder,
    async (req, res) => {
        if (!req.user)
            return res.redirect("/auth/log-in");
        const id = parseInt(req.params.id);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorsObj = {};
            errors.array().forEach(error => {
                if (error.path in errorsObj)
                    errorsObj[error.path] = `• ${errorsObj[error.path]} <br> • ${error.msg}`;
                else
                    errorsObj[error.path] = error.msg;
            });

            const folder = await prisma.folders.findUnique({ where: { id: id }, include: { share_link: { select: { link: true } } } });
            const result = await prisma.files.findMany({ where: { folders: folder } });
            const filesWithData = result.map((file) => {
                const extraData = getContentType(file);
                return { ...file, ...extraData };
            });
            return res.render("inside-folder", { files: filesWithData, folder: folder, is_shared: false, renameError: errorsObj, recoveredName: req.body.name });
        }
        const result = await prisma.folders.update({ where: { id: id }, data: { title: req.body.name } })
        return res.redirect("/folder/" + id);
    }
];

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
    const folder = await prisma.folders.findUnique({ where: { id: id } });
    if (folder.ownerId != req.user.id)
        return res.redirect("/files");

    const duration = parseInt(req.body.duration);
    if (!duration) {
        return res.redirect("/folder/" + id);
    }
    if (duration > 365) {
        const result = await prisma.files.findMany({ where: { folders: folder } });
        const filesWithData = result.map((file) => {
            const extraData = getContentType(file);
            return { ...file, ...extraData };
        });
        return res.render("inside-folder", { files: filesWithData, folder: folder, is_shared: false, durationError: "For security, the maximum duration is 365 days" });
    }
    const futureDate = new Date();
    const identifier = crypto.randomUUID().split("-")[0];
    futureDate.setDate(futureDate.getDate() + parseInt(req.body.duration));
    const result = await prisma.share_links.create({
        data: {
            folderId: id,
            link: identifier,
            expires_at: futureDate,
        },
    });
    res.redirect("/folder/" + id);
}

async function deleteShareLink(req, res) {
    if (!req.user) {
        return res.redirect("/auth/log-in")
    }
    const id = parseInt(req.params.id);
    const folder = await prisma.folders.findUnique({ where: { id: id }, include: { share_link: true } });
    if (folder.ownerId != req.user.id)
        return res.redirect("/files");
    if (!folder.share_link)
        res.redirect("/folder/" + id);
    const result = await prisma.share_links.delete({ where: { id: folder.share_link.id } });
    res.redirect("/folder/" + id);
}

async function fileListFromSharedFolderGet(req, res) {
    const shareLink = await prisma.share_links.findUnique({ where: { link: req.params.shareLink } });
    if(!shareLink)
        return res.redirect("/files");
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
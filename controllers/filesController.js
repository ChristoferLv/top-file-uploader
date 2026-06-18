import { prisma } from "../lib/prisma.js"
import { getContentType } from "../utils/fileUtils.js";
import { getAllFolders } from "./folderController.js";

async function getAllFiles(req) {
    try {
        const files = await prisma.files.findMany({
            where:
            {
                ownerId: req.user.id,
                AND: { folderId: null }
            },
            include: {
                owner:
                {
                    select:
                        { username: true }
                }
            },
            orderBy:{uploaded_at:"desc"}
        });
        return files;
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function fileListGet(req, res) {
    if (!req.user)
        return res.redirect("/auth/log-in")
    const files = await getAllFiles(req);
    const filesWithData = files.map((file) => {
        const extraData = getContentType(file);
        return { ...file, ...extraData };
    });

    const folders = await getAllFolders(req);
    res.render("home", { files: filesWithData, folders: folders });
}

async function newFileFormPost(req, res) {
    if (!req.user)
        return res.redirect("/files");
    if (!req.file) {
        return res.redirect("/files");
    }
    let content = null;
    if (req.file.size > 5000000) {
        const files = await getAllFiles(req);
        const filesWithData = files.map((file) => {
            const extraData = getContentType(file);
            return { ...file, ...extraData };
        });

        const folders = await getAllFolders(req);
        return res.render("home", { files: filesWithData, folders: folders, fileError: "Maximum file size is 5MB" });
    }
    if (req.file.mimetype.split("/")[0] == 'text')
        content = new Buffer.from(req.file.buffer).toString('utf8');
    else
        content = new Buffer.from(req.file.buffer).toString('base64');

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
        res.redirect("/files")
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function newFileOnFolderFormPost(req, res) {
    if (!req.user) {
        return res.redirect("/auth/log-in")
    }
    const id = parseInt(req.params.id);
    const folder = await prisma.folders.findUnique({ where: { id: id }, include: { share_link: { select: { link: true } } } });
    if (folder.ownerId != req.user.id) {
        return res.redirect("/files");
    }
    if (!req.file) {
        return res.redirect("/folder/" + id);
    }
    let content = null;
    if (req.file.size > 5000000) {
        const result = await prisma.files.findMany({ where: { folders: folder } });
        const filesWithData = result.map((file) => {
            const extraData = getContentType(file);
            return { ...file, ...extraData };
        });

        return res.render("inside-folder", { files: filesWithData, folder: folder, is_shared: false, fileError: "Maximum file size is 5MB" });
    }
    if (req.file.mimetype.split("/")[0] == 'text')
        content = new Buffer.from(req.file.buffer).toString('utf8');
    else
        content = new Buffer.from(req.file.buffer).toString('base64');

    try {
        const result = await prisma.files.create({
            data: {
                title: req.file.originalname,
                mime: req.file.mimetype,
                size: req.file.size,
                content: content,
                ownerId: req.user.id,
                folderId: folder.id
            }
        });
        res.redirect("/folder/" + id);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function downloadFile(req, res) {
    if (!req.user) {
        return res.redirect("/auth/log-in")
    }
    const file = await prisma.files.findUnique({ where: { id: parseInt(req.params.id) } });
    if (file.ownerId != req.user.id) {
        return res.redirect("/files");
    }
    const encode = file.mime.split("/")[0] == 'text' ? "utf8" : "base64";
    const myBuffer = Buffer.from(file.content, encode);
    res.setHeader('Content-Disposition', `attachment; filename=${file.title}`);
    res.setHeader('Content-Type', `${file.mime}`);
    res.send(myBuffer);
}

async function getFileById(req, res) {
    if (!req.user) {
        return res.redirect("/auth/log-in")
    }
    const file = await prisma.files.findUnique({
        where:
            { id: parseInt(req.params.id) }, include: {
                owner:
                    { select: { username: true } }
            }
    });
    if (file.ownerId != req.user.id) {
        return res.redirect("/files");
    }
    const extraData = getContentType(file);
    res.render("file-details", { file: { ...file, ...extraData } });
}

async function getSharedFileById(req, res) {
    const file = await prisma.files.findUnique({
        where:
            { id: parseInt(req.params.fileId) }, include: {
                owner:
                    { select: { username: true } },
                // folders: true
            }
    });
    const folder = await prisma.folders.findFirst({ where: { share_link: { link: req.params.shareLink } } });
    if (file.folderId != folder.id)
        return res.redirect("/files");
    const extraData = getContentType(file);
    res.render("file-details", { file: { ...file, ...extraData } });
}

async function deleteFilePost(req, res) {
    if (!req.user)
        return res.redirect("/files");

    const id = parseInt(req.params.id);

    const file = await prisma.files.findUnique({ where: { id: id } });
    if (!file || file.ownerId != req.user.id)
        res.redirect("/files");

    try {
        const result = await prisma.files.delete({ where: { id: id } });
        res.redirect("/files")
    } catch (error) {
        console.log(error);
        next(error);
    }
}


export {
    newFileFormPost,
    fileListGet,
    downloadFile,
    getFileById,
    newFileOnFolderFormPost,
    deleteFilePost,
    getSharedFileById,
    getAllFiles
}
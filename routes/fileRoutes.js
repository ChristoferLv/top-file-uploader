import { Router } from "express";
import { fileListGet, newFileFormGet, newFileFormPost, downloadFile, getFileById, newFileOnFolderFormPost } from "../controllers/filesController.js";
const filesRouter = Router();

import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage:storage });

filesRouter.get("/", fileListGet)
filesRouter.get("/new-file", newFileFormGet)
filesRouter.post("/new-file", upload.single("fileContent"), newFileFormPost)
filesRouter.get("/download/:id", downloadFile)
filesRouter.get("/file/:id", getFileById)
filesRouter.post("/upload-on-folder/:id", upload.single("fileContent"), newFileOnFolderFormPost)


export default filesRouter;

import { Router } from "express";
import { fileListGet, newFileFormPost, downloadFile, getFileById, newFileOnFolderFormPost, deleteFilePost } from "../controllers/filesController.js";
const filesRouter = Router();

import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage:storage });

filesRouter.get("/", fileListGet);
filesRouter.post("/new-file", upload.single("fileContent"), newFileFormPost);
filesRouter.get("/download/:id", downloadFile);
filesRouter.get("/file/:id", getFileById);
filesRouter.post("/upload-on-folder/:id", upload.single("fileContent"), newFileOnFolderFormPost);
filesRouter.post("/delete/:id", upload.single("fileContent"), deleteFilePost);


export default filesRouter;

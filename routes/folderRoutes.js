import { Router } from "express";
import { createNewFolderPost, createShareLink, deleteFolder, fileListFromFolderGet, fileListFromSharedFolderGet, renameFolder } from "../controllers/folderController.js";
import { getSharedFileById } from "../controllers/filesController.js";
const folderRoutes = Router();


folderRoutes.get("/:id", fileListFromFolderGet)
folderRoutes.post("/", createNewFolderPost)
folderRoutes.post("/:id/rename", renameFolder)
folderRoutes.post("/:id/delete", deleteFolder)
folderRoutes.post("/:id/share", createShareLink)
folderRoutes.get("/shared/:shareLink", fileListFromSharedFolderGet)
folderRoutes.get("/shared/:shareLink/file/:fileId", getSharedFileById)



export default folderRoutes;

import { Router } from "express";
import { createNewFolderPost, deleteFolder, fileListFromFolderGet, renameFolder } from "../controllers/folderController.js";
const folderRoutes = Router();


folderRoutes.get("/:id", fileListFromFolderGet)
folderRoutes.post("/", createNewFolderPost)
folderRoutes.post("/:id/rename", renameFolder)
folderRoutes.post("/:id/delete", deleteFolder)



export default folderRoutes;

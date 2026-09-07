import express from "express";
import {
    createBook,
    deleteBook,
    getAllBook,
    getBookById,
    searchBooks,
    updateBook,
} from "../controllers/book-controller.js";
import { uploadBookFiles } from "../middlewares/upload.js";

const router = express.Router();

router.get("/search", searchBooks);
router.get("/", getAllBook);
router.get("/:id", getBookById);
router.post(
    "/",
    uploadBookFiles.fields([
        {
            name: "coverImage",
            maxCount: 1,
        },
        {
            name: "audioFiles",
            maxCount: 100,
        },
        {
            name: "subtitleFiles",
            maxCount: 100,
        },
    ]),
    createBook,
);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
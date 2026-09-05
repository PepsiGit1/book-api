import express from "express";
import {
    createBook,
    deleteBook,
    getAllBook,
    getBookById,
    searchBooks,
    updateBook,
} from "../controllers/book-controller.js";
import { uploadBookCover } from "../middlewares/upload.js";

const router = express.Router();

router.get("/search", searchBooks);
router.get("/", getAllBook);
router.get("/:id", getBookById);
router.post("/", uploadBookCover.single("coverImage"), createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
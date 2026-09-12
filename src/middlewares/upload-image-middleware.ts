import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "profiles",
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(
      file.originalname,
    );

    const filename =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extension}`;

    cb(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed.",
      ),
    );
  }
};

export const uploadProfile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
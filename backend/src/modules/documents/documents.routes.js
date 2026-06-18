const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, restrictTo } = require('../../middleware/auth');
const {
  uploadDocument,
  ingestDocumentUrl,
  getDocuments,
  getDocumentById,
  deleteDocument
} = require('./documents.controller');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseFloat(process.env.MAX_FILE_SIZE_MB || '20') * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,md').split(',');
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${process.env.ALLOWED_FILE_TYPES} files are allowed`));
    }
  }
});

router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/upload', upload.single('file'), uploadDocument);
router.post('/url', ingestDocumentUrl);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

module.exports = router;

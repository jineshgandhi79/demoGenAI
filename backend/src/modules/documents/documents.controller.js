const fs = require('fs');
const Document = require('../../models/Document');
const { ingestPdf, ingestMarkdown, ingestUrl } = require('../../services/ingestionService');
const { deleteVectorsByDocumentId } = require('../../services/qdrantService');
const { logEvent } = require('../../services/analyticsService');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded or invalid file type');
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const sourceType = ext === 'pdf' ? 'PDF' : 'MARKDOWN';

    const document = new Document({
      title: req.file.originalname,
      sourceType,
      filePath: req.file.path,
      status: 'PROCESSING'
    });
    await document.save();

    const fileBuffer = fs.readFileSync(req.file.path);

    if (sourceType === 'PDF') {
      ingestPdf(document._id, fileBuffer)
        .then(() => logEvent('DOCUMENT_UPLOADED', { documentId: document._id, title: document.title }, req.user.id))
        .catch((err) => console.error('Ingestion failed for PDF:', err));
    } else {
      ingestMarkdown(document._id, fileBuffer)
        .then(() => logEvent('DOCUMENT_UPLOADED', { documentId: document._id, title: document.title }, req.user.id))
        .catch((err) => console.error('Ingestion failed for Markdown:', err));
    }

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

const ingestDocumentUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      throw new BadRequestError('URL is required');
    }

    const document = new Document({
      title: url,
      sourceType: 'URL',
      sourceUrl: url,
      status: 'PROCESSING'
    });
    await document.save();

    ingestUrl(document._id, url)
      .then(() => logEvent('DOCUMENT_UPLOADED', { documentId: document._id, title: document.title }, req.user.id))
      .catch((err) => console.error('Ingestion failed for URL:', err));

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    await deleteVectorsByDocumentId(document._id.toString());

    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
      }
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  ingestDocumentUrl,
  getDocuments,
  getDocumentById,
  deleteDocument
};

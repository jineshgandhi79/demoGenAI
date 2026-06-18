const axios = require('axios');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');
const geminiService = require('./geminiService');
const qdrantService = require('./qdrantService');

const chunkText = (text, size = 1000, overlap = 200) => {
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    const chunk = text.slice(index, index + size);
    chunks.push(chunk);
    if (index + size >= text.length) {
      break;
    }
    index += (size - overlap);
  }
  return chunks;
};

const stripMarkdown = (markdown) => {
  return markdown
    .replace(/[#*`~_]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, '\n')
    .trim();
};

const extractTextFromHtml = (html) => {
  let text = html;
  text = text.replace(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&nbsp;/gi, ' ')
             .replace(/&lt;/gi, '<')
             .replace(/&gt;/gi, '>')
             .replace(/&amp;/gi, '&')
             .replace(/&quot;/gi, '"')
             .replace(/&#39;/gi, "'");
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

const ingestPdf = async (documentId, fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    const text = data.text;
    await processTextIngestion(documentId, text, 'PDF');
  } catch (error) {
    await Document.findByIdAndUpdate(documentId, { status: 'FAILED' });
    throw error;
  }
};

const ingestMarkdown = async (documentId, fileBuffer) => {
  try {
    const markdownText = fileBuffer.toString('utf-8');
    const text = stripMarkdown(markdownText);
    await processTextIngestion(documentId, text, 'MARKDOWN');
  } catch (error) {
    await Document.findByIdAndUpdate(documentId, { status: 'FAILED' });
    throw error;
  }
};

const ingestUrl = async (documentId, url) => {
  try {
    const timeout = parseInt(process.env.URL_FETCH_TIMEOUT_MS || '10000', 10);
    const maxLength = parseInt(process.env.MAX_URL_CONTENT_LENGTH || '500000', 10);

    const response = await axios.get(url, {
      timeout,
      maxContentLength: maxLength
    });

    const html = response.data;
    const text = extractTextFromHtml(html);
    await processTextIngestion(documentId, text, 'URL');
  } catch (error) {
    await Document.findByIdAndUpdate(documentId, { status: 'FAILED' });
    throw error;
  }
};

const processTextIngestion = async (documentId, text, sourceType) => {
  const chunkSize = parseInt(process.env.CHUNK_SIZE || '1000', 10);
  const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP || '200', 10);

  const textChunks = chunkText(text, chunkSize, chunkOverlap);
  if (textChunks.length === 0) {
    await Document.findByIdAndUpdate(documentId, { status: 'COMPLETED', chunksCount: 0 });
    return;
  }

  const chunksWithEmbeddings = [];
  for (const chunk of textChunks) {
    const embedding = await geminiService.getEmbedding(chunk);
    chunksWithEmbeddings.push({
      documentId: documentId.toString(),
      chunkText: chunk,
      sourceType,
      embedding
    });
  }

  await qdrantService.upsertChunks(chunksWithEmbeddings);

  await Document.findByIdAndUpdate(documentId, {
    status: 'COMPLETED',
    chunksCount: textChunks.length
  });
};

module.exports = {
  ingestPdf,
  ingestMarkdown,
  ingestUrl
};

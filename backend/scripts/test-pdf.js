require('dotenv').config({ path: 'd:/Projects/AI Customer support/backend/.env' });
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const qdrantService = require('../src/services/qdrantService');

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

async function getEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-embedding-001';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

  const response = await axios.post(url, {
    model: `models/${model}`,
    content: {
      parts: [{ text }]
    },
    outputDimensionality: parseInt(process.env.QDRANT_VECTOR_SIZE || '768', 10)
  });

  if (response.data && response.data.embedding && response.data.embedding.values) {
    return response.data.embedding.values;
  }
  throw new Error('Failed to generate embedding');
}

async function createIndex() {
  const qdrantUrl = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  const collectionName = process.env.QDRANT_COLLECTION_NAME;

  console.log('Creating documentId index on Qdrant...');
  try {
    const response = await axios.put(`${qdrantUrl}/collections/${collectionName}/index`, {
      field_name: 'documentId',
      field_schema: 'keyword'
    }, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Index creation API response:', response.data);
  } catch (error) {
    console.error('Error creating index:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error(error);
    }
  }
}

async function test() {
  await createIndex();

  const pdfPath = 'C:\\Users\\jines\\Documents\\ticket_booking_system_knowledge_base.pdf';
  console.log('Reading PDF file:', pdfPath);
  try {
    const fileBuffer = fs.readFileSync(pdfPath);
    console.log('Parsing PDF...');
    const data = await pdfParse(fileBuffer);
    const text = data.text;
    console.log('Total text length parsed:', text.length);

    const textChunks = chunkText(text, 1000, 200);
    console.log(`Split into ${textChunks.length} chunks.`);

    const chunksWithEmbeddings = [];
    if (textChunks.length > 0) {
      console.log('Testing embedding generation for first chunk...');
      const embedding = await getEmbedding(textChunks[0]);
      console.log('Generated embedding vector of size:', embedding.length);

      chunksWithEmbeddings.push({
        documentId: 'test-doc-id-123456789',
        chunkText: textChunks[0],
        sourceType: 'PDF',
        embedding
      });

      console.log('Testing Qdrant upsert...');
      await qdrantService.upsertChunks(chunksWithEmbeddings);
      console.log('Qdrant upsert successful!');

      console.log('Testing Qdrant search...');
      const searchResults = await qdrantService.searchVectors(embedding, 3);
      console.log('Search returned results:', searchResults.length);

      console.log('Testing Qdrant delete...');
      await qdrantService.deleteVectorsByDocumentId('test-doc-id-123456789');
      console.log('Qdrant delete successful!');
    }
  } catch (error) {
    console.error('Error during full ingestion simulation:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error(error);
    }
  }
}

test();

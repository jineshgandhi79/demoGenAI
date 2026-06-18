const axios = require('axios');
const crypto = require('crypto');

const getClient = () => {
  const qdrantUrl = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  return axios.create({
    baseURL: qdrantUrl,
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });
};

const upsertChunks = async (chunks) => {
  const client = getClient();
  const collectionName = process.env.QDRANT_COLLECTION_NAME;

  const points = chunks.map(chunk => ({
    id: crypto.randomUUID(),
    vector: chunk.embedding,
    payload: {
      documentId: chunk.documentId,
      chunkText: chunk.chunkText,
      sourceType: chunk.sourceType,
      metadata: chunk.metadata || {}
    }
  }));

  await client.put(`/collections/${collectionName}/points`, {
    points
  });
};

const searchVectors = async (vector, limit = 5) => {
  const client = getClient();
  const collectionName = process.env.QDRANT_COLLECTION_NAME;

  const response = await client.post(`/collections/${collectionName}/points/search`, {
    vector,
    limit,
    with_payload: true
  });

  if (response.data && response.data.result) {
    return response.data.result.map(hit => ({
      id: hit.id,
      score: hit.score,
      documentId: hit.payload.documentId,
      chunkText: hit.payload.chunkText,
      sourceType: hit.payload.sourceType,
      metadata: hit.payload.metadata
    }));
  }
  return [];
};

const deleteVectorsByDocumentId = async (documentId) => {
  const client = getClient();
  const collectionName = process.env.QDRANT_COLLECTION_NAME;

  await client.post(`/collections/${collectionName}/points/delete`, {
    filter: {
      must: [
        {
          key: 'documentId',
          match: {
            value: documentId
          }
        }
      ]
    }
  });
};

module.exports = {
  upsertChunks,
  searchVectors,
  deleteVectorsByDocumentId
};

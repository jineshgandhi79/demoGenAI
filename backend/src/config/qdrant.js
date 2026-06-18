const axios = require('axios');

const initQdrant = async () => {
  const qdrantUrl = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  const collectionName = process.env.QDRANT_COLLECTION_NAME;
  const vectorSize = parseInt(process.env.QDRANT_VECTOR_SIZE || '768', 10);

  const client = axios.create({
    baseURL: qdrantUrl,
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  try {
    await client.get(`/collections/${collectionName}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      try {
        await client.put(`/collections/${collectionName}`, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine'
          }
        });
      } catch (createError) {
        throw createError;
      }
    } else {
      throw error;
    }
  }

  try {
    await client.put(`/collections/${collectionName}/index`, {
      field_name: 'documentId',
      field_schema: 'keyword'
    });
  } catch (indexError) {
    // If the index already exists (409) or collection is not ready, check response status
    if (!indexError.response || (indexError.response.status !== 409 && indexError.response.status !== 400)) {
      throw indexError;
    }
  }
};

module.exports = { initQdrant };

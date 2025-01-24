import { pineconeClient } from '../modules/pinecone/server/pinecone-client';

export const run = async () => {
  const targetIndex = process.env.PINECONE_INDEX ?? '';
  const targetNamespace = '6792435a4bd0f07f02962276'; // Replace with the name of namespace to delete

  try {
    const index = pineconeClient.index(targetIndex);
    await index.namespace(targetNamespace).deleteAll();
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to delete your namespace');
  }
};

(async () => {
  await run();
  console.log('delete complete');
})();

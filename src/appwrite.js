import { Client, Databases, Query, ID } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm) => {
  try {
    // Defensive: ensure searchTerm is a string and not empty
    if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) return;
    // Appwrite expects permissions for createDocument
    await database.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      { searchTerm, count: 1, title: searchTerm }
    );
  } catch (error) {
    // If document already exists, increment count
    if (error.code === 409) {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('searchTerm', searchTerm)]
        );
        if (result.documents.length > 0) {
          const doc = result.documents[0];
          await database.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            doc.$id,
            { count: (doc.count || 0) + 1, title: searchTerm }
          );
        }
      } catch (updateError) {
        console.error('Appwrite update error:', updateError);
      }
    } else {
      console.error('Appwrite create error:', error);
    }
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.limit(5),
        Query.orderDesc('count')
      ]
    );
    // Always return objects with a title field for trending
    return result.documents.map(doc => ({ ...doc, title: doc.title || doc.searchTerm || 'Untitled' }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
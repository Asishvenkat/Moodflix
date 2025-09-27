import { Client, Databases, ID, Query } from "appwrite";

// ✅ Ensure .env variables are properly loaded
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

console.log("Appwrite Config:", {
    PROJECT_ID,
    DATABASE_ID,
    COLLECTION_ID,
});

// ✅ Fix endpoint (use HTTPS)
const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1") // Ensure correct endpoint
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        console.log(`Updating search count for: ${searchTerm}`);

        // ✅ Fix listDocuments query format
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal("searchTerm", searchTerm),
        ]);

        if (result.documents.length > 0) {
            const doc = result.documents[0];

            console.log("Existing document found, updating count...");
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1, // Increment count
            });

        } else {
            console.log("No existing document found, creating new record...");
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }

        console.log("Search count updated successfully!");

    } catch (error) {
        console.error("❌ Error updating search count:", error.message);
        console.error("Full Error:", error);
    }

};

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return result.documents;
    } catch (error) {
        console.error("❌ Error fetching trending movies:", error.message);
        console.error("Full Error:", error);
        return []; // Always return an array to prevent runtime errors
    }
};

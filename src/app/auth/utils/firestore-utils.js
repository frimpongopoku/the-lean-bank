import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { makeDate } from "@/app/lib/utils";

export const POTS = "POTS";

// Dev-only preview (/preview): serve fixtures and swallow writes so the
// real database is never read or touched.
export const PREVIEW = { on: false, data: null };
const previewOn = () => process.env.NODE_ENV === "development" && PREVIEW.on;
export const TRANSACTIONS = "TRANSACTIONS";
export const BORROWED = "BORROWED";

/**
 * Initialize a user's Firestore collection if it doesn't exist
 * @param {string} userId - The authenticated user's ID
 */
export const initUserCollection = async (userId, cb) => {
  if (previewOn()) return cb && cb(true);
  try {
    const userCollectionRef = collection(db, userId);
    const userDocRef = doc(userCollectionRef, "meta");
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      // Create the user's collection and meta document
      await setDoc(userDocRef, {
        createdAt: makeDate(),
      });

      // Create default documents within the user's collection
      await setDoc(doc(db, userId, POTS), { key: userId, pots: [] });
      await setDoc(doc(db, userId, TRANSACTIONS), {
        key: userId,
        transactions: [],
      });
      await setDoc(doc(db, userId, BORROWED), { key: userId, borrowed: [] });
      cb && cb(true);
      console.log(`FS-DB atts initialized successfully.`);
    } else {
      cb && cb(true);

      console.log(`User is an old Gee :)`);
    }
  } catch (error) {
    cb && cb(false, "Failed to initialize FS-DB.");
    console.error("Error initializing FS-DB Collection:", error);
    throw new Error("Failed to initialize FS-DB.");
  }
};

/**
 * Retrieve all content of a user's collection
 * @param {string} userId - The authenticated user's ID
 * @returns {object} - The entire user collection data
 */
export const getUserCollection = async (userId) => {
  if (previewOn()) return JSON.parse(JSON.stringify(PREVIEW.data || {}));
  try {
    const userCollectionRef = collection(db, userId);
    const querySnapshot = await getDocs(userCollectionRef);

    let userData = {};
    querySnapshot.forEach((doc) => {
      userData[doc.id] = doc.data();
    });

    return userData;
  } catch (error) {
    console.error("Error retrieving user collection:", error);
    throw new Error("Failed to retrieve collection.");
  }
};

/**
 * Update the POTS document within the user's collection
 * @param {string} userId - The authenticated user's ID
 * @param {object} potsData - The new POTS data to update
 */
export const updatePots = async (userId, potsData) => {
  if (previewOn()) return;
  try {
    const potsRef = doc(db, userId, POTS);
    await setDoc(potsRef, potsData, { merge: true });
    console.log("POTS updated successfully.");
  } catch (error) {
    console.error("Error updating POTS:", error);
    throw new Error("Failed to update POTS.");
  }
};

/**
 * Update the TRANSACTIONS document within the user's collection
 * @param {string} userId - The authenticated user's ID
 * @param {object} transactionsData - The new TRANSACTIONS data to update
 */
export const updateTransactionsInFirestore = async (
  userId,
  transactionsData
) => {
  if (previewOn()) return;
  try {
    const transactionsRef = doc(db, userId, TRANSACTIONS);
    // await setDoc(transactionsRef, transactionsData, { merge: true });
    await setDoc(transactionsRef, transactionsData);
    console.log("TRANSACTIONS updated successfully.");
  } catch (error) {
    console.error("Error updating TRANSACTIONS:", error);
    throw new Error("Failed to update TRANSACTIONS.");
  }
};

/**
 * Update the BORROWED document within the user's collection
 * @param {string} userId - The authenticated user's ID
 * @param {object} borrowedData - The new BORROWED data to update
 */
export const updateBorrowed = async (userId, borrowedData) => {
  if (previewOn()) return;
  try {
    const borrowedRef = doc(db, userId, BORROWED);
    await setDoc(borrowedRef, borrowedData, { merge: true });
    console.log("BORROWED updated successfully.");
  } catch (error) {
    console.error("Error updating BORROWED:", error);
    throw new Error("Failed to update BORROWED.");
  }
};

export const NOT_FOUND = "NOT_FOUND";
/**
 * Fetch all pots from Firestore.
 * Retrieves the "POTS" document from the specified collection.
 *
 * @param {string} collectionId - The Firestore collection ID.
 * @returns {Promise<Array>} - An array of pots.
 */
export const getAllPots = async (collectionId) => {
  if (previewOn()) return PREVIEW.data?.POTS || NOT_FOUND;
  try {
    const potDocRef = doc(db, collectionId, POTS);
    const potSnapshot = await getDoc(potDocRef);

    if (!potSnapshot.exists()) {
      return NOT_FOUND;
      throw new Error("POTS document not found");
    }

    const potData = potSnapshot.data();
    return potData; // Return pots array or empty array if not found
  } catch (error) {
    console.error("Error fetching all pots:", error);
  }
};

/**
 * Function to update pots in Firestore under the specified collection ID.
 * @param {string} collectionId - The collection ID from the URL.
 * @param {Array} pots - The array of pots to be stored in Firestore.
 */
export async function updatePotsInFirestore(collectionId, potData) {
  if (previewOn()) return;
  try {
    const potsRef = doc(db, collectionId, POTS);
    // await setDoc(potsRef, { pots }, { merge: true }); // Merges existing data
    await setDoc(potsRef, potData);
    console.log("Pots successfully updated in Firestore");
  } catch (error) {
    console.error("Error updating pots in Firestore:", error);
  }
}

/**
 * Update the BORROWS document within the user's collection
 * @param {string} userId - The authenticated user's ID
 * @param {object} borrowsData - The new BORROWS data to update
 */
export const updateBorrowsInFirestore = async (userId, borrowsData) => {
  if (previewOn()) return;
  try {
    const borrowsRef = doc(db, userId, BORROWED);
    // await setDoc(borrowsRef, borrowsData, { merge: true });
    await setDoc(borrowsRef, borrowsData);
    console.log("BORROWS updated successfully.");
  } catch (error) {
    console.error("Error updating BORROWS:", error);
    throw new Error("Failed to update BORROWS.");
  }
};

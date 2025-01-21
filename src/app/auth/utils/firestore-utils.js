import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { makeDate } from "@/app/lib/utils";

export const POTS = "POTS";
export const TRANSACTIONS = "TRANSACTIONS";
export const BORROWED = "BORROWED";

/**
 * Initialize a user's Firestore collection if it doesn't exist
 * @param {string} userId - The authenticated user's ID
 */
export const initUserCollection = async (userId) => {
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
      await setDoc(doc(db, userId, POTS), { pots: [] });
      await setDoc(doc(db, userId, TRANSACTIONS), { transactions: [] });
      await setDoc(doc(db, userId, BORROWED), { borrowed: [] });

      console.log(`FS-DB atts initialized successfully.`);
    } else {
      console.log(`User is an old Gee :)`);
    }
  } catch (error) {
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
export const updateTransactions = async (userId, transactionsData) => {
  try {
    const transactionsRef = doc(db, userId, TRANSACTIONS);
    await setDoc(transactionsRef, transactionsData, { merge: true });
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
  try {
    const borrowedRef = doc(db, userId, BORROWED);
    await setDoc(borrowedRef, borrowedData, { merge: true });
    console.log("BORROWED updated successfully.");
  } catch (error) {
    console.error("Error updating BORROWED:", error);
    throw new Error("Failed to update BORROWED.");
  }
};

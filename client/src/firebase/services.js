import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { db, auth, storage } from './config';

// Authentication Services
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Firestore Services
export const createDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    throw error;
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
};

export const queryDocuments = async (collectionName, conditions = [], sortBy = null, limitTo = null) => {
  try {
    let q = collection(db, collectionName);

    if (conditions.length > 0) {
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }

    if (sortBy) {
      q = query(q, orderBy(sortBy.field, sortBy.direction));
    }

    if (limitTo) {
      q = query(q, limit(limitTo));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
};

// Storage Services
export const uploadFile = async (path, file) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    throw error;
  }
};

// Event Services
export const createEvent = async (eventData) => {
  try {
    const eventRef = await createDocument('events', null, {
      ...eventData,
      status: 'active',
    });
    return eventRef;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    await updateDocument('events', eventId, eventData);
  } catch (error) {
    throw error;
  }
};

export const getEvent = async (eventId) => {
  try {
    return await getDocument('events', eventId);
  } catch (error) {
    throw error;
  }
};

export const getUserEvents = async (userId, status = 'active') => {
  try {
    return await queryDocuments('events', [
      { field: 'createdBy', operator: '==', value: userId },
      { field: 'status', operator: '==', value: status },
    ], { field: 'createdAt', direction: 'desc' });
  } catch (error) {
    throw error;
  }
};

// Guest Services
export const addEventGuest = async (eventId, guestData) => {
  try {
    const guestRef = await createDocument(`events/${eventId}/guests`, null, guestData);
    return guestRef;
  } catch (error) {
    throw error;
  }
};

export const updateEventGuest = async (eventId, guestId, guestData) => {
  try {
    await updateDocument(`events/${eventId}/guests`, guestId, guestData);
  } catch (error) {
    throw error;
  }
};

export const getEventGuests = async (eventId) => {
  try {
    return await queryDocuments(`events/${eventId}/guests`, [], 
      { field: 'createdAt', direction: 'asc' });
  } catch (error) {
    throw error;
  }
};

// Message Services
export const sendEventMessage = async (eventId, messageData) => {
  try {
    const messageRef = await createDocument(`events/${eventId}/messages`, null, {
      ...messageData,
      status: 'sent',
    });
    return messageRef;
  } catch (error) {
    throw error;
  }
};

export const getEventMessages = async (eventId) => {
  try {
    return await queryDocuments(`events/${eventId}/messages`, [], 
      { field: 'createdAt', direction: 'desc' });
  } catch (error) {
    throw error;
  }
};

// Reminder Services
export const createEventReminder = async (eventId, reminderData) => {
  try {
    const reminderRef = await createDocument(`events/${eventId}/reminders`, null, {
      ...reminderData,
      status: 'scheduled',
    });
    return reminderRef;
  } catch (error) {
    throw error;
  }
};

export const updateEventReminder = async (eventId, reminderId, reminderData) => {
  try {
    await updateDocument(`events/${eventId}/reminders`, reminderId, reminderData);
  } catch (error) {
    throw error;
  }
};

export const getEventReminders = async (eventId) => {
  try {
    return await queryDocuments(`events/${eventId}/reminders`, [], 
      { field: 'triggerTime', direction: 'asc' });
  } catch (error) {
    throw error;
  }
};

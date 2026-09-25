import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { ProduceItem, ProduceStatus, User } from '../types';

const USERS_COLLECTION = 'users';
const PRODUCE_COLLECTION = 'produce';
const ORDERS_COLLECTION = 'orders';
const ALERTS_COLLECTION = 'price_alerts';
const NOTIFICATIONS_COLLECTION = 'notifications';

export async function savePriceAlertInDb(alert: import('../types').PriceAlert): Promise<void> {
  try {
    await setDoc(doc(db, ALERTS_COLLECTION, alert.id), alert);
  } catch (err) {
    console.warn('Failed to save alert in Firestore, using localStorage fallback', err);
  }
}

export async function deletePriceAlertFromDb(alertId: string): Promise<void> {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, ALERTS_COLLECTION, alertId));
  } catch (err) {
    console.warn('Failed to delete alert in Firestore', err);
  }
}

export async function saveNotificationInDb(notification: import('../types').AppNotification): Promise<void> {
  try {
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notification.id), notification);
  } catch (err) {
    console.warn('Failed to save notification in Firestore', err);
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    if (!fbUser) return null;

    // Check if user document already exists in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, fbUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    }

    // Default new user profile
    const newUser: User = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Andhra Pradesh Farmer/Buyer',
      type: 'farmer',
      village: 'Guntur',
      phone: fbUser.phoneNumber || '+91 94401 23456',
      rating: 4.9,
      totalReviews: 1,
      aadharNumber: 'XXXX-XXXX-8921',
    };

    await setDoc(userDocRef, {
      ...newUser,
      uid: fbUser.uid,
      email: fbUser.email,
      createdAt: new Date().toISOString(),
    });

    return newUser;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export async function saveUserProfile(user: User): Promise<void> {
  const userDocRef = doc(db, USERS_COLLECTION, user.id);
  await setDoc(
    userDocRef,
    {
      ...user,
      uid: user.id,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function createProduceListingInDb(
  item: Omit<ProduceItem, 'id'>,
  customId?: string
): Promise<string> {
  const id = customId || `prod-${Date.now()}`;
  const docRef = doc(db, PRODUCE_COLLECTION, id);
  const produceData: ProduceItem = {
    ...item,
    id,
  };
  await setDoc(docRef, produceData);
  return id;
}

export async function updateProduceStatusInDb(
  id: string,
  newStatus: ProduceStatus
): Promise<void> {
  const docRef = doc(db, PRODUCE_COLLECTION, id);
  await updateDoc(docRef, { status: newStatus });
}

export function subscribeToProduceListings(
  onUpdate: (items: ProduceItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const produceQuery = query(collection(db, PRODUCE_COLLECTION));
  return onSnapshot(
    produceQuery,
    (snapshot) => {
      const items: ProduceItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ProduceItem);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Produce subscription error, using local fallback:', err);
      if (onError) onError(err);
    }
  );
}

export async function seedInitialProduceIfEmpty(initialData: ProduceItem[]): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, PRODUCE_COLLECTION));
    if (snapshot.empty) {
      for (const item of initialData) {
        await setDoc(doc(db, PRODUCE_COLLECTION, item.id), item);
      }
      console.log('Seeded initial produce into Firestore database.');
    }
  } catch (err) {
    console.warn('Initial seeding bypassed or offline:', err);
  }
}

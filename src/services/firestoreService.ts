import { db, auth } from '../config/firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { scheduleNotification } from './notificationService';

// Helper function to calculate days to expiry
const calculateDaysToExpiry = (expirationRefrigerated, expirationRoomTemp, goesInFridge) => {
  const today = new Date();
  const expiryDate = new Date(goesInFridge ? expirationRefrigerated : expirationRoomTemp);
  const diffTime = Math.abs(expiryDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}d`;
};

export const addItemsToFirestore = async (items) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userData || !userData.groups || userData.groups.length === 0) {
      throw new Error('User has no associated groups');
    }

    const groupId = userData.groups[0]; // Assuming the user is part of at least one group
    const itemsCollectionRef = collection(db, 'groups', groupId, 'items');

    const addedItems = [];

    for (const item of items) {
      const newItemRef = doc(itemsCollectionRef);
      await setDoc(newItemRef, {
        name: item.name,
        price: item.price,
        properties: {
          isFood: item.isFood,
          goesInFridge: item.goesInFridge,
          foodCategory: item.foodCategory,
          ripenessIndicators: item.ripenessIndicators,
          canBeLeftOut: item.canBeLeftOut,
          expirationRefrigerated: item.expirationRefrigerated,
          expirationRoomTemp: item.expirationRoomTemp,
          isInFridge: item.goesInFridge,
          expiryNotificationOffset: 2,
          alertStatus: 'active',
          isCustomExpiry: 'No',
          daysToExpiry: calculateDaysToExpiry(item.expirationRefrigerated, item.expirationRoomTemp, item.goesInFridge),
        },
        lists: ['food'],
        status: 'active',
        dateAdded: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      });

      // Schedule notification for item expiry
      const expiryDate = new Date(item.goesInFridge ? item.expirationRefrigerated : item.expirationRoomTemp);
      const notificationDate = new Date(expiryDate);
      notificationDate.setDate(notificationDate.getDate() - 2); // 2 days before expiry

      await scheduleNotification(
        'Food Item Expiring Soon',
        `${item.name} is expiring in 2 days!`,
        { date: notificationDate }
      );

      addedItems.push({ id: newItemRef.id, ...item });
    }

    return addedItems;
  } catch (error) {
    console.error('Error adding items to Firestore:', error);
    throw error;
  }
};

export const getFoodItems = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userData || !userData.groups || userData.groups.length === 0) {
      throw new Error('User has no associated groups');
    }

    const groupId = userData.groups[0]; // Assuming the user is part of at least one group
    const itemsCollectionRef = collection(db, 'groups', groupId, 'items');
    const q = query(itemsCollectionRef, where('status', '==', 'active'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting food items:', error);
    throw error;
  }
};

export const updateFoodItem = async (itemId, updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userData || !userData.groups || userData.groups.length === 0) {
      throw new Error('User has no associated groups');
    }

    const groupId = userData.groups[0]; // Assuming the user is part of at least one group
    const itemDocRef = doc(db, 'groups', groupId, 'items', itemId);

    await updateDoc(itemDocRef, {
      ...updates,
      dateModified: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating food item:', error);
    throw error;
  }
};

export const deleteFoodItem = async (itemId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userData || !userData.groups || userData.groups.length === 0) {
      throw new Error('User has no associated groups');
    }

    const groupId = userData.groups[0]; // Assuming the user is part of at least one group
    const itemDocRef = doc(db, 'groups', groupId, 'items', itemId);

    await deleteDoc(itemDocRef);
  } catch (error) {
    console.error('Error deleting food item:', error);
    throw error;
  }
};
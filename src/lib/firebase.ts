import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  query,
} from 'firebase/firestore';
import { Task } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_TASKS } from '../data/initialTasks';

const app = initializeApp(firebaseConfig);

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const TASKS_COLLECTION = 'tasks';

// Subscribe to real-time updates from Firestore
export const subscribeToTasks = (
  onNext: (tasks: Task[]) => void,
  onError?: (err: Error) => void
) => {
  const tasksRef = collection(db, TASKS_COLLECTION);

  return onSnapshot(
    tasksRef,
    async (snapshot) => {
      // If collection is empty, seed with initial tasks
      if (snapshot.empty) {
        console.log('Firestore tasks collection is empty. Seeding initial data...');
        try {
          await seedInitialTasks();
        } catch (e) {
          console.error('Error seeding initial tasks:', e);
        }
        return;
      }

      const tasksList: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Task;
        tasksList.push({ ...data, id: docSnap.id });
      });

      // Sort by createdAt descending by default
      tasksList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onNext(tasksList);
    },
    (error) => {
      console.error('Error listening to tasks:', error);
      if (onError) onError(error);
    }
  );
};

// Add or Update task
export const saveTaskToFirestore = async (task: Task): Promise<void> => {
  const docRef = doc(db, TASKS_COLLECTION, task.id);
  // Remove undefined fields to prevent Firestore serialization errors
  const cleanTask = JSON.parse(JSON.stringify(task));
  await setDoc(docRef, cleanTask, { merge: true });
};

// Delete task
export const deleteTaskFromFirestore = async (taskId: string): Promise<void> => {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(docRef);
};

// Seed initial tasks if DB empty
export const seedInitialTasks = async (): Promise<void> => {
  const batch = writeBatch(db);
  for (const task of INITIAL_TASKS) {
    const docRef = doc(db, TASKS_COLLECTION, task.id);
    const cleanTask = JSON.parse(JSON.stringify(task));
    batch.set(docRef, cleanTask);
  }
  await batch.commit();
};

// Reset to initial tasks
export const resetToInitialTasksInFirestore = async (): Promise<void> => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const snapshot = await getDocs(query(tasksRef));
  const batch = writeBatch(db);
  
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  
  for (const task of INITIAL_TASKS) {
    const docRef = doc(db, TASKS_COLLECTION, task.id);
    const cleanTask = JSON.parse(JSON.stringify(task));
    batch.set(docRef, cleanTask);
  }

  await batch.commit();
};

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
import { Task, UserAccount } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_TASKS } from '../data/initialTasks';

const app = initializeApp(firebaseConfig);

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'admin',
    username: 'admin',
    password: 'password123',
    fullName: 'Quản trị viên (Admin)',
    email: 'admin@taskflow.app',
    role: 'admin',
    avatar: 'AD',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'demo',
    username: 'demo',
    password: '123456',
    fullName: 'Nguyễn Văn Demo',
    email: 'demo@taskflow.app',
    role: 'member',
    avatar: 'NV',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// Seed default users if users collection is empty
export const seedDefaultUsersIfEmpty = async (): Promise<void> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(query(usersRef));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const u of DEFAULT_USERS) {
        const userDocRef = doc(db, USERS_COLLECTION, u.id);
        batch.set(userDocRef, u);
      }
      await batch.commit();
      console.log('Seeded default users to Firestore collection "users"');
    }
  } catch (err) {
    console.error('Error seeding default users:', err);
  }
};

// Check user credentials against DB
export const checkLoginInFirestore = async (
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserAccount; message?: string }> => {
  try {
    // Ensure default users exist in DB if table is completely fresh
    await seedDefaultUsersIfEmpty();

    const normalized = usernameInput.trim().toLowerCase();
    const usersRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(query(usersRef));

    let matchedUserDoc: UserAccount | null = null;
    snap.forEach((docSnap) => {
      const data = docSnap.data() as UserAccount;
      if (
        data.username?.trim().toLowerCase() === normalized ||
        docSnap.id.toLowerCase() === normalized ||
        data.email?.trim().toLowerCase() === normalized
      ) {
        matchedUserDoc = { ...data, id: docSnap.id };
      }
    });

    if (!matchedUserDoc) {
      return {
        success: false,
        message: 'Tài khoản không tồn tại trong hệ thống! Vui lòng kiểm tra lại tên đăng nhập hoặc đăng ký tài khoản mới.',
      };
    }

    const targetUser: UserAccount = matchedUserDoc;
    if (targetUser.password !== passwordInput.trim()) {
      return {
        success: false,
        message: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại mật khẩu của bạn.',
      };
    }

    // Login successful
    return {
      success: true,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        fullName: targetUser.fullName || targetUser.username,
        email: targetUser.email || '',
        role: targetUser.role || 'member',
        avatar: targetUser.avatar || (targetUser.fullName || targetUser.username).substring(0, 2).toUpperCase(),
        createdAt: targetUser.createdAt,
      },
    };
  } catch (error) {
    console.error('Firestore login error:', error);
    return {
      success: false,
      message: 'Không thể kết nối đến cơ sở dữ liệu để kiểm tra tài khoản. Vui lòng thử lại sau!',
    };
  }
};

// Register a new user into DB
export const registerUserInFirestore = async (newUser: {
  username: string;
  password: string;
  fullName: string;
  email?: string;
}): Promise<{ success: boolean; user?: UserAccount; message?: string }> => {
  try {
    await seedDefaultUsersIfEmpty();

    const normalized = newUser.username.trim().toLowerCase();
    const usersRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(query(usersRef));

    let alreadyExists = false;
    snap.forEach((docSnap) => {
      const data = docSnap.data() as UserAccount;
      if (
        data.username?.trim().toLowerCase() === normalized ||
        docSnap.id.toLowerCase() === normalized
      ) {
        alreadyExists = true;
      }
    });

    if (alreadyExists) {
      return {
        success: false,
        message: `Tên đăng nhập "${newUser.username.trim()}" đã tồn tại trong hệ thống. Vui lòng chọn tên khác!`,
      };
    }

    const docId = normalized.replace(/[^a-zA-Z0-9_-]/g, '_');
    const userDoc: UserAccount = {
      id: docId,
      username: newUser.username.trim(),
      password: newUser.password.trim(),
      fullName: newUser.fullName.trim() || newUser.username.trim(),
      email: newUser.email?.trim() || '',
      role: 'member',
      avatar: (newUser.fullName.trim() || newUser.username.trim()).slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, USERS_COLLECTION, docId), userDoc);

    return {
      success: true,
      user: {
        id: userDoc.id,
        username: userDoc.username,
        fullName: userDoc.fullName,
        email: userDoc.email,
        role: userDoc.role,
        avatar: userDoc.avatar,
        createdAt: userDoc.createdAt,
      },
    };
  } catch (error) {
    console.error('Firestore register error:', error);
    return {
      success: false,
      message: 'Không thể lưu tài khoản vào cơ sở dữ liệu. Vui lòng thử lại!',
    };
  }
};

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

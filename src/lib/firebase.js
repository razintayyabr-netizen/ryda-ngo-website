import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc, where, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBieGnfxoFqHLLZHz-MnHWRzl1eBarD7yo",
  authDomain: "ryda-68015.firebaseapp.com",
  projectId: "ryda-68015",
  storageBucket: "ryda-68015.firebasestorage.app",
  messagingSenderId: "845909692038",
  appId: "1:845909692038:web:94c8c4a51a737e5abacb07"
};

let app;
let db;
let storage;

function getApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb() {
  if (!db) {
    db = getFirestore(getApp());
  }
  return db;
}

export function getStorageInstance() {
  if (!storage) {
    storage = getStorage(getApp());
  }
  return storage;
}

// ========== POSTS ==========

export async function fetchPosts() {
  const db = getDb();
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
  }));
}

export async function fetchPost(id) {
  const db = getDb();
  const docRef = doc(db, 'posts', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createPost(postData, writerToken) {
  const db = getDb();
  const doc = await addDoc(collection(db, 'posts'), {
    title: postData.title,
    category: postData.category || 'Article',
    author: postData.author || 'RYDA Team',
    summary: postData.summary || '',
    content: postData.content || '',
    featured_image: postData.featured_image || null,
    tags: postData.tags || [],
    createdAt: new Date().toISOString(),
    published: true
  });
  return { id: doc.id, ...postData };
}

export async function updatePost(id, postData) {
  const db = getDb();
  const docRef = doc(db, 'posts', id);
  await updateDoc(docRef, {
    ...postData,
    updatedAt: new Date().toISOString()
  });
  return { id, ...postData };
}

export async function deletePost(id) {
  const db = getDb();
  await deleteDoc(doc(db, 'posts', id));
  return { success: true };
}

// ========== IMAGE UPLOAD ==========

export async function uploadImage(file) {
  const storage = getStorageInstance();
  const filename = `images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, filename);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return { url, path: filename };
}

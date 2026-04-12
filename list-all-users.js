import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
let firebaseConfig = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function listAllUsers() {
  console.log('Listing all users...');
  const usersRef = collection(db, 'users');
  const userQuery = await getDocs(query(usersRef));
  
  userQuery.forEach(doc => {
    console.log(`User: ${doc.id} - ${doc.data().displayName} (@${doc.data().username})`);
  });
}

listAllUsers().catch(err => {
  console.error('Error listing users:', err);
  process.exit(1);
});

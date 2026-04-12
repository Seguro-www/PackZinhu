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

async function findInPosts() {
  console.log('Searching in posts...');
  const postsRef = collection(db, 'posts');
  const postQuery = await getDocs(query(postsRef));
  
  let found = false;
  postQuery.forEach(doc => {
    const data = doc.data();
    const dataStr = JSON.stringify(data).toLowerCase();
    if (dataStr.includes('vendedor')) {
      console.log(`Found in post: ${doc.id} - ${JSON.stringify(data)}`);
      found = true;
    }
  });

  if (!found) {
    console.log('No post found containing "vendedor".');
  }
}

findInPosts().catch(err => {
  console.error('Error searching in posts:', err);
  process.exit(1);
});

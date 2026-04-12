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

async function searchAll() {
  console.log('Searching for "Google Drive" and "Vendedor" in all collections...');
  const collections = ['users', 'services', 'posts', 'orders', 'bookmarks', 'bank_accounts'];
  
  for (const colName of collections) {
    console.log(`Checking collection: ${colName}`);
    const colRef = collection(db, colName);
    const snapshot = await getDocs(query(colRef));
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const dataStr = JSON.stringify(data).toLowerCase();
      if (dataStr.includes('google drive') || dataStr.includes('vendedor')) {
        console.log(`Found in ${colName}: ${doc.id} - ${JSON.stringify(data)}`);
      }
    });
  }
  console.log('Search finished.');
}

searchAll().catch(err => {
  console.error('Error during search:', err);
  process.exit(1);
});

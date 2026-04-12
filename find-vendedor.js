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

async function findVendedor() {
  console.log('Searching for "Vendedor"...');
  const usersRef = collection(db, 'users');
  const userQuery = await getDocs(query(usersRef));
  
  let found = false;
  userQuery.forEach(doc => {
    const data = doc.data();
    const dataStr = JSON.stringify(data).toLowerCase();
    if (dataStr.includes('vendedor')) {
      console.log(`Found user: ${doc.id} - ${JSON.stringify(data)}`);
      found = true;
    }
  });

  if (!found) {
    console.log('No user found containing "vendedor".');
  }
}

findVendedor().catch(err => {
  console.error('Error searching for user:', err);
  process.exit(1);
});

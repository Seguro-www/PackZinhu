import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
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

async function listOrders() {
  console.log('Listing orders...');
  const ordersRef = collection(db, 'orders');
  const orderQuery = await getDocs(query(ordersRef, limit(10)));
  
  orderQuery.forEach(doc => {
    console.log(`Order: ${doc.id} - ${JSON.stringify(doc.data())}`);
  });
}

listOrders().catch(err => {
  console.error('Error listing orders:', err);
  process.exit(1);
});

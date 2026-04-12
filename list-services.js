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

async function listServices() {
  console.log('Listing services...');
  const servicesRef = collection(db, 'services');
  const serviceQuery = await getDocs(query(servicesRef));
  
  serviceQuery.forEach(doc => {
    console.log(`Service: ${doc.id} - ${JSON.stringify(doc.data())}`);
  });
}

listServices().catch(err => {
  console.error('Error listing services:', err);
  process.exit(1);
});

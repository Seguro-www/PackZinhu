import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

async function cleanup() {
  console.log('Starting cleanup with client SDK...');

  // 1. Find and delete the service "Acesso ao Google Drive"
  const servicesRef = collection(db, 'services');
  const serviceQuery = await getDocs(query(servicesRef, where('title', '==', 'Acesso ao Google Drive')));
  
  if (serviceQuery.empty) {
    console.log('No service found with title "Acesso ao Google Drive".');
  } else {
    for (const d of serviceQuery.docs) {
      console.log(`Deleting service: ${d.id} (${d.data().title})`);
      await deleteDoc(doc(db, 'services', d.id));
    }
  }

  // 2. Find and delete the user "Vendedor"
  const usersRef = collection(db, 'users');
  const userQuery = await getDocs(query(usersRef, where('displayName', '==', 'Vendedor')));

  if (userQuery.empty) {
    console.log('No user found with displayName "Vendedor".');
  } else {
    for (const d of userQuery.docs) {
      const userData = d.data();
      console.log(`Deleting user: ${d.id} (${userData.displayName})`);
      
      // Also delete services by this user
      const userServices = await getDocs(query(servicesRef, where('sellerId', '==', d.id)));
      for (const sDoc of userServices.docs) {
        console.log(`Deleting related service: ${sDoc.id}`);
        await deleteDoc(doc(db, 'services', sDoc.id));
      }

      await deleteDoc(doc(db, 'users', d.id));
    }
  }

  console.log('Cleanup finished.');
}

cleanup().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

// Initialize Firebase Admin
let db;
if (getApps().length === 0) {
  if (!firebaseConfig.projectId) {
    console.error('Firebase Project ID is missing in firebase-applet-config.json.');
    process.exit(1);
  } else {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
    db = getFirestore(firebaseConfig.firestoreDatabaseId || '(default)');
  }
} else {
  db = getFirestore(firebaseConfig.firestoreDatabaseId || '(default)');
}

async function cleanup() {
  console.log('Starting cleanup...');

  // 1. Find and delete the service "Acesso ao Google Drive"
  const servicesRef = db.collection('services');
  const serviceQuery = await servicesRef.where('title', '==', 'Acesso ao Google Drive').get();
  
  if (serviceQuery.empty) {
    console.log('No service found with title "Acesso ao Google Drive".');
  } else {
    for (const doc of serviceQuery.docs) {
      console.log(`Deleting service: ${doc.id} (${doc.data().title})`);
      await doc.ref.delete();
    }
  }

  // 2. Find and delete the user "Vendedor"
  const usersRef = db.collection('users');
  const userQuery = await usersRef.where('displayName', '==', 'Vendedor').get();

  if (userQuery.empty) {
    console.log('No user found with displayName "Vendedor".');
  } else {
    for (const doc of userQuery.docs) {
      const userData = doc.data();
      console.log(`Deleting user: ${doc.id} (${userData.displayName})`);
      
      // Also delete services by this user just in case
      const userServices = await servicesRef.where('sellerId', '==', doc.id).get();
      for (const serviceDoc of userServices.docs) {
        console.log(`Deleting related service: ${serviceDoc.id}`);
        await serviceDoc.ref.delete();
      }

      await doc.ref.delete();
    }
  }

  console.log('Cleanup finished.');
}

cleanup().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});

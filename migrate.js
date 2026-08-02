import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function migrate() {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    let updated = 0;
    for (const d of querySnapshot.docs) {
        const data = d.data();
        if (!data.listingType) {
            await updateDoc(doc(db, 'properties', d.id), { listingType: 'rent' });
            updated++;
        }
    }
    console.log(`Migrated ${updated} properties`);
}

migrate().catch(console.error);

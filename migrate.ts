import { db } from './src/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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
    process.exit(0);
}

migrate().catch(console.error);

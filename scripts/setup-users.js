#!/usr/bin/env node

// Script to set up initial users in Firebase
// Run with: node scripts/setup-users.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Load environment variables
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleUsers = [
  {
    uid: 'admin-user-1',
    email: 'admin@credexsystems.com',
    displayName: 'System Administrator',
    role: 'admin',
    status: 'active',
  },
  {
    uid: 'client-user-1', 
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    role: 'client',
    status: 'active',
  },
  {
    uid: 'client-user-2',
    email: 'jane.smith@company.com', 
    displayName: 'Jane Smith',
    role: 'client',
    status: 'active',
  },
  {
    uid: 'admin-user-2',
    email: 'nour.kanaan@credexsystems.com',
    displayName: 'Nour Kanaan',
    role: 'admin', 
    status: 'active',
  }
];

async function setupUsers() {
  console.log('🔥 Setting up sample users in Firebase...\n');
  
  try {
    for (const userData of sampleUsers) {
      const userRef = doc(db, 'users', userData.uid);
      
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Added ${userData.role}: ${userData.displayName} (${userData.email})`);
    }
    
    console.log('\n🎉 Sample users created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Log into your app with one of these admin emails');
    console.log('2. Go to Admin Settings to see all users');
    console.log('3. The users should now appear instead of mock data');
    
  } catch (error) {
    console.error('❌ Error setting up users:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure your Firebase project exists');
    console.log('2. Check that Firestore is enabled');
    console.log('3. Verify your .env file has correct Firebase config');
  }
  
  process.exit(0);
}

setupUsers();

# Firebase Configuration & Cost Management

This guide explains how to set up the auto-deletion rules to keep ARC cost-effective.

## 1. Firebase Authentication
Enable **Anonymous Authentication** in your Firebase console. This allows guests to upload photos without creating an account.

## 2. Firestore TTL (Time-To-Live)
To automatically delete photo documents after 1 day:
1. Go to Google Cloud Console > Firestore > TTL.
2. Click **Create Policy**.
3. Set Collection Group to `photos`.
4. Set Timestamp field to `expiresAt`.

## 3. Storage Lifecycle Rules
To automatically delete image files after 1 day:
1. Go to Google Cloud Storage.
2. Select your Firebase storage bucket.
3. Go to the **Lifecycle** tab.
4. Add a rule: 
   - Action: **Delete object**
   - Condition: **Age > 1 day**

These settings ensure that events remain ephemeral and storage costs are minimized!

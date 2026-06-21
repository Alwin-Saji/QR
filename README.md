# ARC (Auto-Real-time Capture) 📸

**ARC** is a modern, open-source real-time photo-sharing platform designed for live events. 
Instead of chasing down friends for photos after a wedding, party, or meetup, ARC lets guests instantly upload and view photos on a shared live gallery. No app downloads or account creation required!

![ARC Landing Page](/public/vite.svg) *Replace with a screenshot of your landing page*

## ✨ Features

- **⚡ Real-time Sync:** Powered by Supabase Realtime. Photos appear instantly on everyone's screen the second they are uploaded.
- **📱 Zero Friction for Guests:** Guests simply scan a QR code. No app downloads, no account creation, no hassle.
- **🎨 Custom QR Codes:** Generate and customize a unique QR code for your event. Print it out and place it on tables!
- **📸 Direct Camera Access:** Guests can snap a live photo or upload an existing one from their camera roll.
- **⬇️ Scan-to-Save:** Guests can walk up to a screen displaying the gallery, scan a specific photo's QR code, and download it instantly to their phone.
- **🔒 Secure & Private:** Backed by Row Level Security. Only you can manage your events and bulk-delete photos.

## 🚀 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Backend/Database:** Supabase (PostgreSQL, Storage, Auth, Realtime)

## 🛠️ Getting Started

Follow these instructions to set up your own instance of ARC.

### 1. Clone the repository
```bash
git clone https://github.com/Alwin-Saji/QR.git
cd QR
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup
You will need a free [Supabase](https://supabase.com/) account.
1. Create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard and run the entire script found in `database.sql`. This will create your tables and apply all necessary security policies.
3. Go to **Storage** and create a new public bucket named exactly `events`.
4. Go to **Authentication -> Providers** and ensure Email/Password login is enabled.

### 4. Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase URL and Anon Key (found in your Supabase project settings):
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Run the App Locally
```bash
npm run dev
```
Your app should now be running on `http://localhost:5173`!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Alwin-Saji/QR/issues).

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

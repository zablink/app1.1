// /pages/settings.tsx
// this is Settings for USER role
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from "next/link";
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
// Corrected: Added FiRefreshCw to the import list
import { FiUser, FiMail, FiLock, FiImage, FiUpload, FiSave, FiEdit, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Layout from "@/components/Layout"; // Ensure this path is correct for your project structure

// Import image compression library (you need to install this: npm install browser-image-compression)
import imageCompression from 'browser-image-compression';

export default function UserSettingsPage() {
  const { data: session, status } = useSession(); // Get session data and status
  const router = useRouter(); // Initialize router

  // --- Console.log: ตรวจสอบสถานะและข้อมูล Session ทันทีที่ component ถูก render ---
  console.log('--- UserSettingsPage Component Render ---');
  console.log('Session Status:', status);
  console.log('Session Data (initial render):', session);
  if (session?.user) {
    console.log('Session User Name (initial render):', session.user.name);
    console.log('Session User Email (initial render):', session.user.email);
    console.log('Session User Image (initial render):', session.user.image);
    // @ts-ignore
    console.log('Session User Role (initial render):', session.user.role); // Log custom role
    // @ts-ignore
    console.log('Session User Membership Type (initial render):', session.user.membership_type); // Log custom membership_type
  } else {
    console.log('Session User is null or undefined on initial render.');
  }
  // --- End Console.log ---

  // Initialize state with session data or default values
  // These states will hold the *editable* values, initialized from the session.
  const [profileName, setProfileName] = useState(session?.user?.name || 'Current User Name');
  const [email, setEmail] = useState(session?.user?.email || 'user@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || 'https://placehold.co/150x150/aabbcc/ffffff?text=User'); // Placeholder avatar
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null); // To store avatar file awaiting upload
  const [isCompressing, setIsCompressing] = useState(false); // New state for loading indicator during compression

  // Authentication protection and session data update effect
  useEffect(() => {
    // --- Console.log: ตรวจสอบสถานะและข้อมูล Session เมื่อ useEffect ทำงาน ---
    console.log('--- useEffect Triggered ---');
    console.log('Current Session Status in useEffect:', status);
    console.log('Current Session Data in useEffect:', session);
    // --- End Console.log ---

    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      console.log('User unauthenticated, redirecting to /login');
      router.push('/login');
    }
    // If authenticated and session data is available, update component state
    // This handles cases where session data might load/change after initial component mount
    else if (status === 'authenticated' && session) {
      console.log('User authenticated, checking session data for state update...');
      // Only update state if the session data is different to prevent unnecessary re-renders
      if (session.user?.name && session.user.name !== profileName) {
        console.log(`Updating profileName from "${profileName}" to "${session.user.name}"`);
        setProfileName(session.user.name);
      } else if (!session.user?.name) {
        console.warn('Session user name is undefined or null.');
      }

      if (session.user?.email && session.user.email !== email) {
        console.log(`Updating email from "${email}" to "${session.user.email}"`);
        setEmail(session.user.email);
      } else if (!session.user?.email) {
        console.warn('Session user email is undefined or null.');
      }

      // Only update avatarUrl if it's different and not currently selecting a new file
      if (session.user?.image && session.user.image !== avatarUrl && !pendingAvatarFile) {
        console.log(`Updating avatarUrl from "${avatarUrl}" to "${session.user.image}"`);
        setAvatarUrl(session.user.image);
      } else if (!session.user?.image) {
        console.warn('Session user image is undefined or null.');
      } else if (pendingAvatarFile) {
        console.log('Skipping avatarUrl update from session because a new avatar file is pending.');
      }
      // --- Console.log: แสดงค่า state หลังการอัปเดตจาก session ---
      console.log('State after useEffect update:');
      console.log('  profileName:', profileName);
      console.log('  email:', email);
      console.log('  avatarUrl:', avatarUrl);
      // --- End Console.log ---
    }
  }, [status, router, session, profileName, email, avatarUrl, pendingAvatarFile]); // Add pendingAvatarFile to dependencies

  // Function to handle avatar selection (for preview and compression)
  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleAvatarSelect triggered.');
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log('Selected file:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');
      setIsCompressing(true); // Start loading indicator

      // Image compression options
      const options = {
        maxSizeMB: 0.1, // Max file size in MB (e.g., 100KB)
        maxWidthOrHeight: 150, // Max width or height in pixels for the output image
        useWebWorker: true, // Use web worker for better performance (recommended)
      };

      try {
        const compressedFile = await imageCompression(file, options);
        console.log('Compressed file:', compressedFile.name, 'Size:', (compressedFile.size / 1024).toFixed(2), 'KB');
        setAvatarUrl(URL.createObjectURL(compressedFile)); // Update for immediate preview
        setPendingAvatarFile(compressedFile); // Store compressed file for later upload
        alert('รูปภาพถูกย่อขนาดแล้ว พร้อมสำหรับการบันทึก');
      } catch (error) {
        console.error('Image compression error:', error);
        alert('เกิดข้อผิดพลาดในการย่อขนาดรูปภาพ');
        setPendingAvatarFile(null); // Clear pending file on error
      } finally {
        setIsCompressing(false); // End loading indicator
      }
    } else {
      console.log('No file selected for avatar.');
    }
  };

  // Function to handle saving profile information (name and avatar)
  const handleSaveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    console.log('--- handleSaveProfileInfo Triggered ---');
    console.log('Attempting to update profile name to:', profileName);
    console.log('Current email:', email); // Email is disabled, but good to log

    // In a real application, you would:
    // 1. Update the user's name in your database (e.g., Supabase table).
    // 2. If the user's name is part of the NextAuth session, you might need to
    //    manually update the session or trigger a session refresh to reflect changes.

    if (pendingAvatarFile) {
      console.log('New avatar file detected. Attempting upload...');
      // In a real application, you would:
      // 1. Upload the 'pendingAvatarFile' (which is already compressed) to Supabase Storage.
      //    Example:
      //    const { data, error } = await supabase.storage.from('avatars').upload(`public/${session.user.id}/avatar.png`, pendingAvatarFile);
      //    if (error) throw error;
      //    const publicURL = supabase.storage.from('avatars').getPublicUrl(`public/${session.user.id}/avatar.png`).data.publicUrl;
      // 2. Update the user's profile in your database (e.g., Supabase table) with the new 'publicURL'.
      //    await supabase.from('profiles').update({ avatar_url: publicURL }).eq('id', session.user.id);
      // 3. Important: After a successful upload and database update, you need to
      //    update the NextAuth session to reflect the new image URL. This often involves:
      //    - Calling `signIn('credentials', { redirect: false, ... })` with updated user data, or
      //    - Using a custom `update` function if your NextAuth setup supports it, or
      //    - Forcing a session refresh (e.g., `router.reload()` or `window.location.reload()`, but this is less ideal as it reloads the entire page).
      //    For now, we'll just simulate the process.
      console.log('Uploading new (compressed) avatar:', pendingAvatarFile.name);
      // Simulate upload success
      setTimeout(() => {
        console.log('Simulated avatar upload complete.');
        alert('รูปโปรไฟล์อัปโหลดแล้ว (จำลอง)');
        setPendingAvatarFile(null); // Clear pending file after simulated upload
        // In a real app, after successful upload to Supabase and DB update,
        // you would refresh the session here to update Navbar and other components.
        // Example: update({ user: { image: publicURL } }); // If NextAuth supports this. Consider calling `refreshSession` if available or `router.reload()` for full refresh.
      }, 500);
    } else {
      console.log('No new avatar file to upload. Only name will be updated (simulated).');
      alert('อัปเดตข้อมูลโปรไฟล์แล้ว');
    }
  };

  // Function to handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('--- handleChangePassword Triggered ---');
    console.log('Current Password entered:', currentPassword ? '********' : 'Not entered');
    console.log('New Password entered:', newPassword ? '********' : 'Not entered');
    console.log('Confirm New Password entered:', confirmNewPassword ? '********' : 'Not entered');

    if (newPassword !== confirmNewPassword) {
      console.error('New password and confirm password do not match.');
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    // In a real application, you would call your authentication service (e.g., NextAuth)
    // to update the password. This typically involves calling a backend API route.
    console.log('Changing password (simulated)...');
    alert('เปลี่ยนรหัสผ่านแล้ว');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // If session is loading or unauthenticated, render a loading spinner or nothing
  if (status === 'loading' || status === 'unauthenticated') {
    console.log('Rendering loading/unauthenticated state. Status:', status);
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </Layout>
    );
  }

  // --- Console.log: แสดงข้อมูลที่ใช้ render หลังจาก Session โหลดเสร็จและ Authenticated ---
  console.log('--- Rendering Authenticated User Settings ---');
  console.log('Profile Name for display:', profileName);
  console.log('Email for display:', email);
  console.log('Avatar URL for display:', avatarUrl);
  // --- End Console.log ---

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>User Profile Settings</title>
        </Head>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">User Profile Settings</h1>

          {/* Profile Information Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <FiUser className="mr-2" /> Profile Information
            </h2>
            <form onSubmit={handleSaveProfileInfo}>
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-md">
                  <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                    {isCompressing ? (
                      <span className="animate-spin text-white"><FiRefreshCw size={24} /></span> // Display loading spinner
                    ) : (
                      <FiUpload size={24} />
                    )}
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} disabled={isCompressing} />
                </div>
                <p className="text-gray-600 mt-2">Update your profile picture</p>
                {pendingAvatarFile && (
                  <p className="text-sm text-blue-500 mt-1">
                    New image ready to save (Size: {(pendingAvatarFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                  <input
                    type="text"
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled // Email usually cannot be changed directly from here, depends on auth provider
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 text-right">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={isCompressing} // Disable button during compression
                >
                  {isCompressing ? (
                    <span className="flex items-center"><FiRefreshCw className="animate-spin mr-2" /> Compressing...</span>
                  ) : (
                    <><FiSave className="mr-2" /> Save Profile Information</>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <FiLock className="mr-2" /> Change Password
            </h2>
            <form onSubmit={handleChangePassword}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 text-right">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Save Password
                </motion.button>
              </div>
            </form>
          </div>

          {/* Become a Shop Section */}
          <div className="p-6 border border-gray-200 rounded-lg bg-blue-50">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
              <FiShoppingBag className="mr-2" /> Want to become a Shop?
            </h2>
            <p className="text-gray-700 mb-4">
              If you are a restaurant owner and want to promote your business on our platform, you can register as a shop here.
            </p>
            <Link href="/register-shop">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiShoppingBag className="mr-2" /> Register as a Shop
              </motion.a>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
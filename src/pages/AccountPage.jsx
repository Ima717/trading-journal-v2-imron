import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, ShieldCheck, Settings, GitBranch, CreditCard, Database, HelpCircle,
    Eye, EyeOff, AlertTriangle, CheckCircle, X, Info, Loader2, UploadCloud, LogOut, Calendar, Clock // New Icons
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Imports (Ensure paths are correct)
import { auth, db } from '../utils/firebase';
import {
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser,
    signOut // Added signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; // Added Storage

// Context Hooks (Ensure paths are correct)
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// --- Tabs Configuration ---
// Added HelpCircle to tabs
const tabs = [
  { name: 'Profile', icon: User },
  { name: 'Security', icon: ShieldCheck },
  { name: 'Preferences', icon: Settings },
  { name: 'Integrations', icon: GitBranch },
  // { name: 'Subscription', icon: CreditCard },
  { name: 'Data Management', icon: Database },
  { name: 'Help & Support', icon: HelpCircle }, // Added Help tab
];

// --- Basic UI Helper Components (Keep InputField, PasswordInputField, LoadingButton, Modal, Toast from previous version) ---
// (Assuming InputField, PasswordInputField, LoadingButton, Modal, Toast are defined as in the previous response)
// --- InputField ---
const InputField = ({ id, label, type = 'text', value, onChange, placeholder, disabled = false, required = false, className = '' }) => { /* ...implementation from previous response... */ };
// --- PasswordInputField ---
const PasswordInputField = ({ id, label, value, onChange, placeholder, required = false, className = '' }) => { /* ...implementation from previous response... */ };
// --- LoadingButton ---
const LoadingButton = ({ children, onClick, isLoading = false, disabled = false, type = 'button', variant = 'primary', className = '' }) => { /* ...implementation from previous response... */ };
// --- Modal ---
const Modal = ({ isOpen, onClose, title, children }) => { /* ...implementation from previous response... */ };
// --- Toast ---
const Toast = ({ message, type, isVisible, onClose }) => { /* ...implementation from previous response... */ };


// --- Skeleton Components ---
const SkeletonText = ({ className = 'h-4 w-3/4' }) => (
    <div className={`bg-gray-200 dark:bg-zinc-700 rounded animate-pulse ${className}`}></div>
);
const SkeletonAvatar = ({ className = 'h-20 w-20 rounded-full' }) => (
     <div className={`bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse ${className}`}></div>
);
const SkeletonButton = ({ className = 'h-10 w-24' }) => (
    <div className={`bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse ${className}`}></div>
);
const SkeletonInput = ({ className = 'h-10 w-full' }) => (
     <div className={`bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse ${className}`}></div>
);
const SkeletonCard = ({ children }) => (
    <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 space-y-4">
        {children}
    </div>
);


// --- Password Strength Checker ---
const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: 'bg-gray-300 dark:bg-zinc-600' };

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++; // Symbols

    let label = 'Weak';
    let color = 'bg-red-500';
    if (score >= 6) {
        label = 'Very Strong';
        color = 'bg-emerald-500';
    } else if (score >= 5) {
        label = 'Strong';
        color = 'bg-green-500';
    } else if (score >= 3) {
        label = 'Medium';
        color = 'bg-yellow-500';
    }
    // Width calculation: cap score at 5 for width to avoid exceeding 100% easily
    const widthPercent = Math.min(score, 5) * 20;

    return { score, label, color, widthPercent };
};


// --- Account Page Component ---
const AccountPage = () => {
    const { user, setUser } = useAuth(); // Get user AND setUser from Auth context
    const { theme } = useTheme();
    const navigate = useNavigate();
    const storage = getStorage(); // Initialize Storage
    const fileInputRef = useRef(null); // Ref for file input

    // --- State ---
    const [activeTab, setActiveTab] = useState(tabs[0].name);
    const [profileData, setProfileData] = useState({ displayName: '', photoURL: user?.photoURL || '', creationTime: user?.metadata?.creationTime });
    const [preferencesData, setPreferencesData] = useState({ defaultCurrency: 'USD', dateFormat: 'YYYY-MM-DD', timeFormat: '24hr' }); // Added formatting defaults
    const [isLoading, setIsLoading] = useState({ page: true, profile: false, avatar: false, password: false, preferences: false, delete: false });
    const [error, setError] = useState({ profile: '', avatar: '', password: '', preferences: '', delete: '', reauth: '' });
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
    const [modalState, setModalState] = useState({ type: null, isOpen: false });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
    const [isEditingName, setIsEditingName] = useState(false); // For inline editing
    const [tempDisplayName, setTempDisplayName] = useState(''); // Temp state for inline edit input
    const [avatarUploadProgress, setAvatarUploadProgress] = useState(0); // For upload progress (optional)

    // --- Utility Functions (showToast, setLoading, setErrorMessage, clearErrors, closeModal from previous version) ---
    const showToast = useCallback((message, type = 'info', duration = 3000) => { /* ...implementation... */ }, []);
    const setLoading = useCallback((key, value) => setIsLoading(prev => ({ ...prev, [key]: value })), []);
    const setErrorMessage = useCallback((key, message) => setError(prev => ({ ...prev, [key]: message })), []);
    const clearErrors = useCallback((...keys) => setError(prev => { /* ...implementation... */ }), []);
    const closeModal = useCallback(() => { /* ...implementation... clear sensitive fields */ }, []);


    // --- Data Fetching ---
    const fetchUserData = useCallback(async () => {
        if (!user) {
            setIsLoading(prev => ({...prev, page: false}));
            return;
        }
        setLoading('page', true);
        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            // Get creation time directly from auth metadata if available
            const creationTime = user.metadata?.creationTime;

            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfileData({
                    displayName: data.displayName || user.displayName || '',
                    photoURL: data.photoURL || user.photoURL || '', // Check Firestore first, then Auth
                    creationTime: creationTime
                });
                // Merge saved preferences with defaults, ensuring defaults are used if nothing is saved
                setPreferencesData(prevDefaults => ({ ...prevDefaults, ...data.preferences }));
            } else {
                 // Doc doesn't exist, use Auth data & defaults
                 setProfileData({
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    creationTime: creationTime
                 });
                 console.log("No user document found in Firestore, using Auth profile and default preferences.");
                 // Keep default preferences state
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            showToast("Failed to load user data.", "error");
            setProfileData({ // Fallback on error
                 displayName: user.displayName || '',
                 photoURL: user.photoURL || '',
                 creationTime: user.metadata?.creationTime
            });
        } finally {
            setLoading('page', false);
        }
    }, [user, showToast]); // Dependency on user and showToast

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);


    // --- Event Handlers ---

    // Start inline editing for Display Name
    const handleEditNameClick = () => {
        setTempDisplayName(profileData.displayName); // Store current name in temp state
        setIsEditingName(true);
        clearErrors('profile');
    };

    // Cancel inline editing
    const handleCancelEditName = () => {
        setIsEditingName(false);
        setErrorMessage('profile',''); // Clear any errors from potential failed save
    };

     // Save Display Name (from inline edit)
    const handleSaveDisplayName = async () => {
        if (!user) return;
        const newName = tempDisplayName.trim();
        if (newName === profileData.displayName) { // No change
            setIsEditingName(false);
            return;
        }
        if (!newName) {
            setErrorMessage('profile', 'Display name cannot be empty.');
            return;
        }

        setLoading('profile', true);
        clearErrors('profile');

        try {
            // 1. Update Auth profile
            await updateProfile(auth.currentUser, { displayName: newName });

            // 2. Update Firestore (Create or Update)
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, { displayName: newName, updatedAt: Timestamp.now() }, { merge: true });

            // Update local state
            setProfileData(prev => ({ ...prev, displayName: newName }));
            showToast("Display name updated successfully!", "success");
            setIsEditingName(false); // Exit editing mode
        } catch (err) {
            console.error("Error saving display name:", err);
            setErrorMessage('profile', `Failed to save name: ${err.message}`);
            showToast("Failed to save display name.", "error");
            // Keep editing mode open on error? Yes.
        } finally {
            setLoading('profile', false);
        }
    };


    // Trigger hidden file input
    const handleAvatarChangeClick = () => {
        fileInputRef.current?.click();
    };

    // Handle Avatar Upload
    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Basic validation (type, size)
        if (!file.type.startsWith('image/')) {
             setErrorMessage('avatar', 'Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
             setErrorMessage('avatar', 'Image size should not exceed 5MB.');
             return;
        }

        setLoading('avatar', true);
        clearErrors('avatar');
        setAvatarUploadProgress(0); // Reset progress

        const avatarRef = ref(storage, `avatars/${user.uid}/${file.name}`); // Path in Storage

        try {
            // --- Optional: Delete previous avatar if it exists and filename changes ---
            // This requires storing the previous avatar path or using a fixed filename like 'avatar.jpg'
            // Example (if previous URL known and path can be derived):
            // if (profileData.photoURL) {
            //     try {
            //         const previousAvatarRef = ref(storage, profileData.photoURL); // Need URL -> Ref conversion logic
            //         await deleteObject(previousAvatarRef);
            //     } catch (deleteError) {
            //         // Handle potential errors if previous file doesn't exist or deletion fails, but don't block upload
            //         console.warn("Could not delete previous avatar:", deleteError);
            //     }
            // }

            // Upload file
            const snapshot = await uploadBytes(avatarRef, file);
             // You can use uploadTask = uploadBytesResumable(avatarRef, file) and listen to 'state_changed'
             // events to update setAvatarUploadProgress accurately if needed.
             // For simplicity here, we assume completion after uploadBytes finishes.
             setAvatarUploadProgress(100);

            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Update Auth Profile
            await updateProfile(auth.currentUser, { photoURL: downloadURL });

             // Update Firestore (Create or Update)
             const userDocRef = doc(db, "users", user.uid);
             await setDoc(userDocRef, { photoURL: downloadURL, updatedAt: Timestamp.now() }, { merge: true });

            // Update local state
            setProfileData(prev => ({ ...prev, photoURL: downloadURL }));
            showToast("Avatar updated successfully!", "success");

        } catch (err) {
             console.error("Error uploading avatar:", err);
             setErrorMessage('avatar', `Upload failed: ${err.message}`);
             showToast("Avatar upload failed.", "error");
        } finally {
             setLoading('avatar', false);
             setAvatarUploadProgress(0); // Reset progress display
             event.target.value = null; // Reset file input
        }
    };


    // Handle Preferences Change (Already defined, keep as is)
    const handlePreferencesChange = (e) => { /* ...implementation... */ };
    // Handle Save Preferences (Already defined, keep as is)
    const handleSavePreferences = async () => { /* ...implementation... */ };

    // Handle Re-authenticate (Already defined, keep as is)
    const handleReauthenticate = async (password) => { /* ...implementation... */ };
    // Handle Change Password Attempt (Already defined, keep as is)
    const handleChangePasswordAttempt = () => { /* ...implementation... */ };
    // Handle Re-authenticate And Change Password (Already defined, keep as is)
    const handleReauthenticateAndChangePassword = async (e) => { /* ...implementation... */ };

    // Handle Delete Account Attempt (Already defined, keep as is)
    const handleDeleteAccountAttempt = () => { /* ...implementation... */ };
    // Handle Re-authenticate And Confirm Delete (Already defined, keep as is)
     const handleReauthenticateAndConfirmDelete = async (e) => { /* ...implementation... */ };
    // Handle Final Delete Account (Already defined, keep as is)
     const handleFinalDeleteAccount = async () => { /* ...implementation... */ };

     // Handle Sign Out (For Active Sessions section)
     const handleSignOut = async () => {
         try {
             await signOut(auth);
             setUser(null); // Update context immediately
             showToast("Signed out successfully.", "success");
             navigate('/signin'); // Redirect to sign-in page
         } catch (error) {
              console.error("Sign out error:", error);
              showToast("Failed to sign out.", "error");
         }
     };


    // Handle Export Data (Placeholder - Already defined, keep as is)
    const handleExportData = () => { /* ...implementation... */ };

    // --- Date Formatting ---
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp); // Works for Firebase Timestamps via toDate() or direct string/number
        // Using Intl for basic formatting based on preference
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }; // Default options
            // Basic adaptation based on preferenceData.dateFormat - can be made more robust
             if (preferencesData.dateFormat === 'MM/DD/YYYY') {
                 return date.toLocaleDateString('en-US'); // Example format
             } else if (preferencesData.dateFormat === 'DD/MM/YYYY') {
                 return date.toLocaleDateString('en-GB'); // Example format
             } else { // Default to YYYY-MM-DD or Intl default
                 return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
             }
        } catch (e) {
            console.error("Date formatting error", e);
            return date.toDateString(); // Fallback
        }
    };

    const formatTime = (timestamp) => {
         if (!timestamp) return '';
         const date = new Date(timestamp);
          try {
             const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: preferencesData.timeFormat === '12hr' };
             return date.toLocaleTimeString(undefined, options); // Use user's locale
         } catch (e) {
             console.error("Time formatting error", e);
             return '';
         }
    };


    // --- Framer Motion Variants (Keep `contentVariants` from previous response) ---
     const contentVariants = useMemo(() => ({ /* ...implementation... */ }), []);


    // --- Render Content Function ---
    const renderTabContent = () => {

        let content;
        switch (activeTab) {
          case 'Profile':
            content = (
              <>
                <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Profile Information</h2>
                <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-zinc-700">
                        <div className="relative flex-shrink-0">
                             {/* Display Avatar or Placeholder */}
                            <img
                                src={profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || user?.email || 'User')}&background=random&color=fff&size=128`}
                                alt="Profile Avatar"
                                className="h-24 w-24 rounded-full object-cover shadow-md"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=Error&background=random&color=fff&size=128` }} // Fallback on error
                            />
                            {/* Loading/Upload Overlay */}
                            {isLoading.avatar && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                     <Loader2 size={24} className="animate-spin text-white" />
                                     {/* Optional: Display progress: <span className="text-white text-xs mt-1">{avatarUploadProgress}%</span> */}
                                </div>
                            )}
                         </div>
                         <div>
                             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Profile Picture</h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Upload a new avatar. Square images work best. Max 5MB.</p>
                              <input
                                 type="file"
                                 accept="image/*"
                                 ref={fileInputRef}
                                 onChange={handleAvatarUpload}
                                 className="hidden" // Hide default input
                                 disabled={isLoading.avatar}
                             />
                              <LoadingButton
                                 onClick={handleAvatarChangeClick}
                                 isLoading={isLoading.avatar}
                                 variant="secondary"
                                 className="text-sm"
                              >
                                  <UploadCloud size={16} className="mr-2" />
                                  Upload Image
                             </LoadingButton>
                              {error.avatar && <p className="text-red-500 text-xs mt-2">{error.avatar}</p>}
                         </div>
                    </div>

                    {/* Display Name Inline Edit */}
                     <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                         {isEditingName ? (
                             <div className="flex items-center gap-2">
                                 <input
                                     type="text"
                                     value={tempDisplayName}
                                     onChange={(e) => setTempDisplayName(e.target.value)}
                                     className="flex-grow p-2.5 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
                                     placeholder="Enter display name"
                                     autoFocus
                                     disabled={isLoading.profile}
                                 />
                                  <LoadingButton onClick={handleSaveDisplayName} isLoading={isLoading.profile} variant="primary" className="px-3 py-2 text-sm">Save</LoadingButton>
                                  <LoadingButton onClick={handleCancelEditName} variant="secondary" className="px-3 py-2 text-sm" disabled={isLoading.profile}>Cancel</LoadingButton>
                              </div>
                         ) : (
                             <div className="flex items-center gap-3 p-2.5 min-h-[44px]"> {/* Match input height approx */}
                                 <span className="text-zinc-900 dark:text-white text-sm">{profileData.displayName || <span className="italic text-gray-400 dark:text-gray-500">No name set</span>}</span>
                                 <button onClick={handleEditNameClick} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">Edit</button>
                              </div>
                         )}
                          {error.profile && <p className="text-red-500 text-xs mt-1">{error.profile}</p>}
                      </div>

                    {/* Email Display (Read Only) */}
                     <InputField
                         id="email" label="Email Address" type="email" value={user?.email || ''} disabled className="mb-1"
                     />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Email cannot be changed via this page.</p>

                     {/* Account Creation Date */}
                     <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Created</label>
                         <p className="text-sm text-gray-600 dark:text-gray-400 p-2.5">{profileData.creationTime ? formatDate(profileData.creationTime) : 'Loading...'}</p>
                     </div>

                </div>
              </>
            );
            break;

          case 'Security':
            content = (
              <>
                 <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Security Settings</h2>
                 {/* Password Change Card */}
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Last updated: {/* TODO: Store last password update time */} Never</p>
                    <LoadingButton
                         onClick={handleChangePasswordAttempt}
                         isLoading={isLoading.password && modalState.type === 'reauth-password'}
                         variant="secondary"
                    >
                         Change Password
                    </LoadingButton>
                 </div>

                 {/* Active Sessions Card (Placeholder) */}
                  <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                     <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Active Sessions</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This shows where your account is currently logged in. Listing all sessions requires advanced setup.</p>
                     <div className="border border-dashed border-gray-300 dark:border-zinc-600 rounded-md p-6 text-center text-gray-500 dark:text-gray-400 mb-4">
                         Session list is not available in this version.
                     </div>
                     {/* Sign out current session */}
                      <LoadingButton
                          onClick={handleSignOut}
                          variant="secondary"
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                           <LogOut size={16} className="mr-2"/> Sign Out This Device
                      </LoadingButton>
                  </div>

                 {/* 2FA Card (Placeholder - Kept from previous code) */}
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 opacity-60"> {/* ... 2FA placeholder ... */} </div>
              </>
            );
            break;

           case 'Preferences':
            content = (
               <>
                 <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Application Preferences</h2>
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                    {/* Appearance Theme Display (Keep as is) */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-zinc-700"> {/* ... Theme ... */} </div>

                    {/* Default Currency Dropdown (Keep as is) */}
                    <div className="mb-5"> {/* ... Currency ... */} </div>

                    {/* Date/Time Formatting */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-5">
                          <div>
                             <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
                             <select id="dateFormat" name="dateFormat" value={preferencesData.dateFormat} onChange={handlePreferencesChange} className="w-full p-2.5 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150">
                                 <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., {formatDate(new Date().toISOString(), { dateFormat: 'YYYY-MM-DD' })})</option>
                                 <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., {formatDate(new Date().toISOString(), { dateFormat: 'MM/DD/YYYY' })})</option>
                                 <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., {formatDate(new Date().toISOString(), { dateFormat: 'DD/MM/YYYY' })})</option>
                              </select>
                          </div>
                           <div>
                             <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Format</label>
                             <select id="timeFormat" name="timeFormat" value={preferencesData.timeFormat} onChange={handlePreferencesChange} className="w-full p-2.5 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150">
                                  <option value="24hr">24-hour (e.g., {formatTime(new Date().toISOString(), { timeFormat: '24hr' })})</option>
                                  <option value="12hr">12-hour AM/PM (e.g., {formatTime(new Date().toISOString(), { timeFormat: '12hr' })})</option>
                              </select>
                          </div>
                     </div>

                    {/* Notification Preferences Placeholder (Keep as is) */}
                     <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-zinc-700 opacity-60"> {/* ... Notifications ... */} </div>

                     {error.preferences && <p className="text-red-500 text-sm mt-2 mb-3">{error.preferences}</p>}
                     <LoadingButton onClick={handleSavePreferences} isLoading={isLoading.preferences} variant="primary"> Save Preferences </LoadingButton>
                 </div>
               </>
            );
            break;

           // --- Integrations, Subscription (Placeholders - Keep as is) ---
           case 'Integrations': content = ( <> /* ... */ </> ); break;
           // case 'Subscription': content = ( <> /* ... */ </> ); break;

           // --- Data Management (Placeholders/Existing - Keep as is) ---
           case 'Data Management': content = ( <> /* ... */ </> ); break;


           // --- Help & Support Tab ---
            case 'Help & Support':
             content = (
               <>
                 <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Help & Support</h2>
                  {/* Card for Contact */}
                  <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                     <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Contact Us</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Have questions or need assistance? Reach out directly via email.
                      </p>
                      <a
                          href="mailto:2006imron@gmail.com?subject=Trading%20Journal%20Support"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800"
                      >
                         Email Support (2006imron@gmail.com)
                     </a>
                  </div>
                  {/* Card for FAQ/Docs (Placeholder) */}
                  <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6 opacity-60">
                      <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">FAQ & Documentation</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Find answers to common questions and learn how to use the app features.</p>
                       <LoadingButton disabled={true} variant="secondary">
                          View Docs (Coming Soon)
                       </LoadingButton>
                  </div>
                   {/* App Version */}
                   <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
                       App Version: {import.meta.env.VITE_APP_VERSION || '1.0.0-dev'} {/* Use env var or placeholder */}
                   </div>
               </>
             );
             break; // End Help & Support

          default:
            content = <div>Select a category.</div>;
        }

        return ( /* ... AnimatePresence wrapper from previous code ... */ );
    };

     // --- Render Modal Content ---
    const renderModalContent = () => {
        switch(modalState.type) {
            case 'reauth-password': // Need to add strength indicator here
            case 'reauth-delete':
                const isDeleting = modalState.type === 'reauth-delete';
                const passwordStrength = checkPasswordStrength(newPassword);
                return (
                     <form onSubmit={isDeleting ? handleReauthenticateAndConfirmDelete : handleReauthenticateAndChangePassword}>
                         {/* ... current password input ... */}
                          <PasswordInputField id="reauthPassword" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required={true}/>

                         {!isDeleting && (
                            <>
                                 {/* ... new password input ... */}
                                 <PasswordInputField id="newPassword" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required={true}/>
                                 {/* Password Strength Indicator */}
                                 {newPassword && (
                                     <div className="mt-2 mb-2">
                                         <div className="h-2 w-full bg-gray-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                                             <div
                                                 className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                 style={{ width: `${passwordStrength.widthPercent}%` }}
                                             ></div>
                                         </div>
                                         <p className={`text-xs mt-1 font-medium ${
                                             passwordStrength.score < 3 ? 'text-red-500' :
                                             passwordStrength.score < 5 ? 'text-yellow-500' : 'text-green-500'
                                             }`}
                                         >
                                             Strength: {passwordStrength.label}
                                         </p>
                                     </div>
                                 )}
                                 {/* ... confirm new password input ... */}
                                 <PasswordInputField id="confirmNewPassword" label="Confirm New Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required={true}/>
                            </>
                         )}
                         {/* ... errors and buttons ... */}
                     </form>
                );

             case 'confirm-delete': return ( /* ...implementation from previous code... */ );
            default: return null;
        }
    };


     // --- Skeleton Loader for Initial Load ---
     const renderSkeletonLoader = () => (
         <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 animate-pulse">
             {/* Skeleton Tabs Nav */}
             <div className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                 <div className="flex flex-col space-y-1 bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md">
                     {tabs.map((tab) => (
                         <div key={tab.name} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                              <div className="h-5 w-5 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                              <SkeletonText className="h-4 w-2/3"/>
                         </div>
                     ))}
                 </div>
             </div>
             {/* Skeleton Content Area */}
             <div className="flex-1 min-w-0 space-y-6">
                  <SkeletonText className="h-7 w-1/3 mb-5"/>
                  <SkeletonCard>
                      <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-zinc-700">
                          <SkeletonAvatar/>
                          <div className="space-y-2 flex-1">
                              <SkeletonText className="h-5 w-1/4"/>
                              <SkeletonText className="h-4 w-full"/>
                              <SkeletonButton className="h-9 w-32 mt-2"/>
                          </div>
                      </div>
                       <div className="space-y-3 pt-2">
                           <SkeletonText className="h-4 w-1/5"/>
                           <SkeletonInput/>
                           <SkeletonText className="h-4 w-1/5"/>
                           <SkeletonInput/>
                       </div>
                  </SkeletonCard>
             </div>
         </div>
     );

    // --- Main Render ---
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-white">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-8 text-zinc-900 dark:text-white">Account Settings</h1>

                {/* Show Skeleton or Actual Content */}
                {isLoading.page ? renderSkeletonLoader() : (
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
                         {/* --- Tabs Nav --- */}
                         <div className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                             <nav className="flex flex-col space-y-1 bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md sticky top-6"> {/* ... Tabs mapping ... */} </nav>
                         </div>

                         {/* --- Content Area --- */}
                          <div className="flex-1 min-w-0">
                             {renderTabContent()}
                          </div>
                    </div>
                )}
            </div>

             {/* Modal & Toast Rendering (Keep as is) */}
             <Modal isOpen={modalState.isOpen} onClose={closeModal} title={/* ... modal title logic ... */}> {renderModalContent()} </Modal>
             <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({...prev, isVisible: false}))}/>
        </div>
    );
};

export default AccountPage;

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, ShieldCheck, Settings, GitBranch, CreditCard, Database, HelpCircle,
    Eye, EyeOff, AlertTriangle, CheckCircle, X, Info, Loader2, UploadCloud, LogOut // Icons
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
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Context Hooks (Ensure paths are correct)
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Assuming this exists

// --- Tabs Configuration ---
const tabs = [
  { name: 'Profile', icon: User },
  { name: 'Security', icon: ShieldCheck },
  { name: 'Preferences', icon: Settings },
  { name: 'Integrations', icon: GitBranch },
  // { name: 'Subscription', icon: CreditCard }, // Uncomment if needed
  { name: 'Data Management', icon: Database },
  { name: 'Help & Support', icon: HelpCircle },
];

// --- Basic UI Helper Components ---

// Input Field
const InputField = ({ id, label, type = 'text', value, onChange, placeholder, disabled = false, required = false, className = '' }) => {
    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`w-full p-2.5 border rounded-md shadow-sm text-sm
                    ${disabled ? 'bg-gray-100 dark:bg-zinc-700 cursor-not-allowed' : 'bg-white dark:bg-zinc-700'}
                    border-gray-300 dark:border-zinc-600
                    text-zinc-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-zinc-500
                    focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                    transition duration-150 ease-in-out`}
            />
        </div>
    );
};

// Password Input Field with Visibility Toggle
const PasswordInputField = ({ id, label, value, onChange, placeholder, required = false, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className={`mb-4 relative ${className}`}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
                type={isVisible ? 'text' : 'password'}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                 className={`w-full p-2.5 border rounded-md shadow-sm text-sm pr-10
                    bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600
                    text-zinc-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500
                    focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                    transition duration-150 ease-in-out`}
            />
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={isVisible ? "Hide password" : "Show password"}
            >
                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
};

// Loading Button
const LoadingButton = ({ children, onClick, isLoading = false, disabled = false, type = 'button', variant = 'primary', className = '' }) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out inline-flex items-center justify-center";
    const darkFocusOffset = "dark:focus:ring-offset-zinc-900"; // Adjusted for dark bg

    const variants = {
        primary: `bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 ${darkFocusOffset} disabled:bg-indigo-400`,
        secondary: `border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:ring-indigo-500 ${darkFocusOffset} disabled:opacity-50`,
        danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ${darkFocusOffset} disabled:bg-red-400`,
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseClasses} ${variants[variant]} ${isLoading || disabled ? 'cursor-not-allowed opacity-70' : ''} ${className}`}
        >
            {isLoading ? (
                <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }} className="mr-2" > <Loader2 size={18} /> </motion.div> Processing...
                </>
            ) : ( children )}
        </button>
    );
};

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    const { theme } = useTheme();
    useEffect(() => {
        const handleEscape = (event) => { if (event.key === 'Escape') onClose(); };
        if (isOpen) { document.addEventListener('keydown', handleEscape); }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration: 0.2}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose} >
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className={`relative w-full max-w-md rounded-lg shadow-xl overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-zinc-800'}`} onClick={(e) => e.stopPropagation()} >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                            <button onClick={onClose} className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Close modal" > <X size={20} /> </button>
                        </div>
                        <div className="p-6"> {children} </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Simple Toast Notification
const Toast = ({ message, type, isVisible, onClose }) => {
    useEffect(() => { let timer; if (isVisible) { timer = setTimeout(onClose, 4000); } return () => clearTimeout(timer); }, [isVisible, onClose]);
    if (!isVisible) return null;
    const icons = { success: <CheckCircle size={20} className="text-green-500" />, error: <AlertTriangle size={20} className="text-red-500" />, info: <Info size={20} className="text-blue-500" /> };
    const colors = { success: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200', error: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200', info: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200' }
    return (
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className={`fixed bottom-5 right-5 z-[60] w-full max-w-sm p-4 rounded-lg border shadow-lg ${colors[type] || colors.info}`} role="alert" >
            <div className="flex items-start"> <div className="flex-shrink-0 mr-3">{icons[type] || icons.info}</div> <div className="flex-1 text-sm font-medium mr-3">{message}</div> <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex focus:outline-none focus:ring-2 focus:ring-current" aria-label="Close"> <X size={18} /> </button> </div>
        </motion.div>
    );
}

// --- Skeleton Components ---
const SkeletonText = ({ className = 'h-4 w-3/4' }) => ( <div className={`bg-gray-200 dark:bg-zinc-700 rounded animate-pulse ${className}`}></div> );
const SkeletonAvatar = ({ className = 'h-24 w-24 rounded-full' }) => ( <div className={`bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse ${className}`}></div> );
const SkeletonButton = ({ className = 'h-10 w-24' }) => ( <div className={`bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse ${className}`}></div> );
const SkeletonInput = ({ className = 'h-10 w-full' }) => ( <div className={`bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse ${className}`}></div> );
const SkeletonCard = ({ children }) => ( <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 space-y-4"> {children} </div> );

// --- Password Strength Checker ---
const checkPasswordStrength = (password) => {
    let score = 0; if (!password) return { score: 0, label: '', color: 'bg-gray-200 dark:bg-zinc-600', widthPercent: 0 };
    if (password.length >= 8) score++; if (password.length >= 12) score++; if (/[a-z]/.test(password)) score++; if (/[A-Z]/.test(password)) score++; if (/\d/.test(password)) score++; if (/[^A-Za-z0-9]/.test(password)) score++;
    let label = 'Weak'; let color = 'bg-red-500'; if (score >= 6) { label = 'Very Strong'; color = 'bg-emerald-500'; } else if (score >= 5) { label = 'Strong'; color = 'bg-green-500'; } else if (score >= 3) { label = 'Medium'; color = 'bg-yellow-500'; } const widthPercent = Math.min(score, 5) * 20;
    return { score, label, color, widthPercent };
};

// --- Account Page Component ---
const AccountPage = () => {
    const { user, setUser } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const storage = getStorage();
    const fileInputRef = useRef(null);

    // --- State ---
    const [activeTab, setActiveTab] = useState(tabs[0].name);
    const [profileData, setProfileData] = useState({ displayName: '', photoURL: '', creationTime: null });
    const [preferencesData, setPreferencesData] = useState({ defaultCurrency: 'USD', dateFormat: 'YYYY-MM-DD', timeFormat: '24hr' });
    const [isLoading, setIsLoading] = useState({ page: true, profile: false, avatar: false, password: false, preferences: false, delete: false });
    const [error, setError] = useState({ profile: '', avatar: '', password: '', preferences: '', delete: '', reauth: '' });
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
    const [modalState, setModalState] = useState({ type: null, isOpen: false });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempDisplayName, setTempDisplayName] = useState('');

    // --- Utility Functions ---
     const showToast = useCallback((message, type = 'info') => { setToast({ isVisible: true, message, type }); }, []);
     const setLoading = useCallback((key, value) => setIsLoading(prev => ({ ...prev, [key]: value })), []);
     const setErrorMessage = useCallback((key, message) => setError(prev => ({ ...prev, [key]: message })), []);
     const clearErrors = useCallback((...keys) => setError(prev => { const next = {...prev}; keys.forEach(k => { if(next[k] !== undefined) next[k] = ''; }); return next; }), []);
     const closeModal = useCallback(() => { setModalState({ type: null, isOpen: false }); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setDeleteConfirmationInput(''); clearErrors('reauth', 'password', 'delete'); }, [clearErrors]);

    // --- Data Fetching ---
     const fetchUserData = useCallback(async () => {
         if (!user) { setIsLoading(prev => ({...prev, page: false})); return; }
         try {
             const userDocRef = doc(db, "users", user.uid); const docSnap = await getDoc(userDocRef); const creationTime = user.metadata?.creationTime;
             if (docSnap.exists()) {
                 const data = docSnap.data();
                 setProfileData(prev => ({ ...prev, displayName: data.displayName ?? user.displayName ?? '', photoURL: data.photoURL ?? user.photoURL ?? '', creationTime: creationTime }));
                 setPreferencesData(prevDefaults => ({ ...prevDefaults, ...data.preferences }));
             } else { setProfileData(prev => ({ ...prev, displayName: user.displayName ?? '', photoURL: user.photoURL ?? '', creationTime: creationTime })); setPreferencesData(prevDefaults => ({ ...prevDefaults })); }
         } catch (err) { console.error("Error fetching user data:", err); showToast("Failed to load user data.", "error"); setProfileData(prev => ({ ...prev, displayName: user.displayName ?? '', photoURL: user.photoURL ?? '', creationTime: user.metadata?.creationTime })); }
         finally { setIsLoading(prev => ({...prev, page: false})); }
     }, [user, showToast]);

    useEffect(() => { setIsLoading(prev => ({...prev, page: true})); fetchUserData(); }, [fetchUserData]);

    // --- Event Handlers ---
    const handleEditNameClick = () => { setTempDisplayName(profileData.displayName); setIsEditingName(true); clearErrors('profile'); };
    const handleCancelEditName = () => { setIsEditingName(false); setErrorMessage('profile',''); };
    const handleSaveDisplayName = async () => { if (!user) return; const newName = tempDisplayName.trim(); if (newName === profileData.displayName) { setIsEditingName(false); return; } if (!newName) { setErrorMessage('profile', 'Display name cannot be empty.'); return; } setLoading('profile', true); clearErrors('profile'); try { await updateProfile(auth.currentUser, { displayName: newName }); const userDocRef = doc(db, "users", user.uid); await setDoc(userDocRef, { displayName: newName, updatedAt: Timestamp.now() }, { merge: true }); setProfileData(prev => ({ ...prev, displayName: newName })); showToast("Display name updated successfully!", "success"); setIsEditingName(false); } catch (err) { console.error("Error saving display name:", err); setErrorMessage('profile', `Failed to save name: ${err.message}`); showToast("Failed to save display name.", "error"); } finally { setLoading('profile', false); } };
    const handleAvatarChangeClick = () => { fileInputRef.current?.click(); };
    const handleAvatarUpload = async (event) => { const file = event.target.files?.[0]; if (!file || !user) return; if (!file.type.startsWith('image/')) { setErrorMessage('avatar', 'Please select an image file.'); return; } if (file.size > 5 * 1024 * 1024) { setErrorMessage('avatar', 'Image size should not exceed 5MB.'); return; } setLoading('avatar', true); clearErrors('avatar'); const avatarRef = ref(storage, `avatars/${user.uid}/avatar-${Date.now()}`); try { const snapshot = await uploadBytes(avatarRef, file); const downloadURL = await getDownloadURL(snapshot.ref); await updateProfile(auth.currentUser, { photoURL: downloadURL }); const userDocRef = doc(db, "users", user.uid); await setDoc(userDocRef, { photoURL: downloadURL, updatedAt: Timestamp.now() }, { merge: true }); setProfileData(prev => ({ ...prev, photoURL: downloadURL })); showToast("Avatar updated successfully!", "success"); } catch (err) { console.error("Error uploading avatar:", err); setErrorMessage('avatar', `Upload failed: ${err.message}`); showToast("Avatar upload failed.", "error"); } finally { setLoading('avatar', false); event.target.value = null; } };
    const handlePreferencesChange = (e) => { setPreferencesData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleSavePreferences = async () => { if (!user) return; setLoading('preferences', true); clearErrors('preferences'); try { const userDocRef = doc(db, "users", user.uid); await setDoc(userDocRef, { preferences: preferencesData, updatedAt: Timestamp.now() }, { merge: true }); showToast("Preferences saved successfully!", "success"); } catch (err) { console.error("Error saving preferences:", err); setErrorMessage('preferences', `Failed to save preferences: ${err.message}`); showToast("Failed to save preferences.", "error"); } finally { setLoading('preferences', false); } };
    const handleReauthenticate = async (password) => { if (!user || !password) { setErrorMessage('reauth', 'Password is required.'); return false; } clearErrors('reauth'); setLoading('password', true); try { const credential = EmailAuthProvider.credential(user.email, password); await reauthenticateWithCredential(auth.currentUser, credential); setLoading('password', false); return true; } catch (err) { console.error("Re-authentication error:", err); setErrorMessage('reauth', `Authentication failed: ${err.code === 'auth/wrong-password' ? 'Incorrect password.' : err.message}`); showToast("Authentication failed.", "error"); setLoading('password', false); return false; } };
    const handleChangePasswordAttempt = () => { setModalState({ type: 'reauth-password', isOpen: true }); };
    const handleReauthenticateAndChangePassword = async (e) => { e.preventDefault(); clearErrors('password'); if (newPassword !== confirmNewPassword) { setErrorMessage('password', 'New passwords do not match.'); return; } if (newPassword.length < 6) { setErrorMessage('password', 'Password must be at least 6 characters long.'); return; } const reauthenticated = await handleReauthenticate(currentPassword); if (reauthenticated) { try { setLoading('password', true); await updatePassword(auth.currentUser, newPassword); setLoading('password', false); closeModal(); showToast("Password updated successfully!", "success"); setNewPassword(''); setConfirmNewPassword(''); } catch (err) { console.error("Error updating password:", err); setErrorMessage('password', `Failed to update password: ${err.message}`); showToast("Failed to update password.", "error"); setLoading('password', false); } } };
    const handleDeleteAccountAttempt = () => { setModalState({ type: 'reauth-delete', isOpen: true }); };
    const handleReauthenticateAndConfirmDelete = async (e) => { e.preventDefault(); const reauthenticated = await handleReauthenticate(currentPassword); if (reauthenticated) { setModalState({ type: 'confirm-delete', isOpen: true }); } };
    const handleFinalDeleteAccount = async () => { if (deleteConfirmationInput !== 'DELETE') { setErrorMessage('delete', 'Type DELETE to confirm.'); return; } if (!user) return; setLoading('delete', true); clearErrors('delete'); try { await deleteUser(auth.currentUser); showToast("Account deleted successfully. You have been logged out.", "success", 5000); setTimeout(() => { navigate('/signin'); closeModal(); }, 4000); } catch (err) { console.error("Error deleting account:", err); setErrorMessage('delete', `Failed to delete account: ${err.message}. Please try again or contact support.`); showToast("Failed to delete account.", "error"); setLoading('delete', false); } };
    const handleSignOut = async () => { try { await signOut(auth); setUser(null); showToast("Signed out successfully.", "success"); navigate('/signin'); } catch (error) { console.error("Sign out error:", error); showToast("Failed to sign out.", "error"); } };
    const handleExportData = () => { showToast("Data export feature is coming soon!", "info"); };

    // --- NEW: Email Support Click Handler ---
    const handleEmailSupportClick = () => {
        const recipient = '2006imron@gmail.com';
        const subject = 'Trading Journal Support';
        const encodedSubject = encodeURIComponent(subject);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodedSubject}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    };

    // --- Date/Time Formatting ---
     const formatDate = useCallback((isoString, formatOptions = preferencesData) => { if (!isoString) return 'N/A'; try { const date = new Date(isoString); if (formatOptions.dateFormat === 'YYYY-MM-DD') return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }); if (formatOptions.dateFormat === 'MM/DD/YYYY') return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }); if (formatOptions.dateFormat === 'DD/MM/YYYY') return date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }); return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { console.error("Date formatting error", e); return 'Invalid Date'; } }, [preferencesData.dateFormat]);
     const formatTime = useCallback((isoString, formatOptions = preferencesData) => { if (!isoString) return ''; try { const date = new Date(isoString); const options = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: formatOptions.timeFormat === '12hr' }; return date.toLocaleTimeString(undefined, options); } catch (e) { console.error("Time formatting error", e); return 'Invalid Time'; } }, [preferencesData.timeFormat]);

    // --- Framer Motion Variants ---
     const contentVariants = useMemo(() => ({ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }, exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } } }), []);

    // --- Render Content Function ---
    const renderTabContent = useCallback(() => {
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
                                    <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || user?.email || 'U')}&background=random&color=fff&size=96`} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow-md" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=Err&background=dfe&color=fff&size=96` }} />
                                    {isLoading.avatar && ( <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"> <Loader2 size={24} className="animate-spin text-white" /> </div> )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Profile Picture</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Upload a new avatar. Max 5MB.</p>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" disabled={isLoading.avatar} />
                                    <LoadingButton onClick={handleAvatarChangeClick} isLoading={isLoading.avatar} variant="secondary" className="text-sm"> <UploadCloud size={16} className="mr-2" /> Upload Image </LoadingButton>
                                    {error.avatar && <p className="text-red-500 text-xs mt-2">{error.avatar}</p>}
                                </div>
                            </div>
                            {/* Display Name Inline Edit */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={tempDisplayName} onChange={(e) => setTempDisplayName(e.target.value)} className="flex-grow p-2.5 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm" placeholder="Enter display name" autoFocus disabled={isLoading.profile} />
                                        <LoadingButton onClick={handleSaveDisplayName} isLoading={isLoading.profile} variant="primary" className="px-3 py-2 text-sm">Save</LoadingButton>
                                        <LoadingButton onClick={handleCancelEditName} variant="secondary" className="px-3 py-2 text-sm" disabled={isLoading.profile}>Cancel</LoadingButton>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-2.5 min-h-[44px]">
                                        <span className="text-zinc-900 dark:text-white text-sm">{profileData.displayName || <span className="italic text-gray-400 dark:text-gray-500">No name set</span>}</span>
                                        <button onClick={handleEditNameClick} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">Edit</button>
                                    </div>
                                )}
                                {error.profile && <p className="text-red-500 text-xs mt-1">{error.profile}</p>}
                            </div>
                            {/* Email */}
                            <InputField id="email" label="Email Address" type="email" value={user?.email || ''} disabled className="mb-1"/>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Email cannot be changed.</p>
                            {/* Creation Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Created</label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 p-2.5">{formatDate(profileData.creationTime)}</p>
                            </div>
                        </div>
                    </>
                );
                break;
            case 'Security':
                content = (
                     <>
                         <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Security Settings</h2>
                         <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Password</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Last updated: Never</p> {/* Placeholder */}
                            <LoadingButton onClick={handleChangePasswordAttempt} isLoading={isLoading.password && modalState.type === 'reauth-password'} variant="secondary"> Change Password </LoadingButton>
                         </div>
                          <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                             <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Active Sessions</h3>
                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This shows where your account is currently logged in. Listing all sessions requires advanced setup.</p>
                             <div className="border border-dashed border-gray-300 dark:border-zinc-600 rounded-md p-6 text-center text-gray-500 dark:text-gray-400 mb-4"> Session list is not available in this version. </div>
                              <LoadingButton onClick={handleSignOut} variant="secondary" className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-900/20" > <LogOut size={16} className="mr-2"/> Sign Out This Device </LoadingButton>
                          </div>
                         <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 opacity-60">
                            <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Add an extra layer of security using an authenticator app.</p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Status: Not Available Yet</p>
                            <LoadingButton disabled={true} variant="primary"> Setup 2FA (Coming Soon) </LoadingButton>
                         </div>
                     </>
                );
                break;
            case 'Preferences':
                 content = (
                    <>
                        <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Application Preferences</h2>
                        <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-zinc-700"> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appearance Theme</label> <p className="text-xs text-gray-500 dark:text-gray-400">Controlled via the toggle in the sidebar.</p> </div> <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{theme}</span> </div>
                            <div className="mb-5"> <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Currency</label> <select id="defaultCurrency" name="defaultCurrency" value={preferencesData.defaultCurrency} onChange={handlePreferencesChange} className="w-full md:w-1/2 p-2.5 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"> <option value="USD">USD - US Dollar</option> <option value="EUR">EUR - Euro</option> <option value="GBP">GBP - British Pound</option> <option value="JPY">JPY - Japanese Yen</option> <option value="CAD">CAD - Canadian Dollar</option> </select> </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-5 pb-4 border-b border-gray-200 dark:border-zinc-700">
                                <div>
                                    <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
                                    <select id="dateFormat" name="dateFormat" value={preferencesData.dateFormat} onChange={handlePreferencesChange} className="w-full p-2.5 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 mb-4 md:mb-0">
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
                            <div className="flex items-center justify-between mb-5 opacity-60"> <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summary Emails</label> <p className="text-xs text-gray-500 dark:text-gray-400">Receive weekly performance summaries.</p> </div> <span className="text-xs font-medium text-gray-400 dark:text-gray-500">(Coming Soon)</span> </div>
                            {error.preferences && <p className="text-red-500 text-sm mt-2 mb-3">{error.preferences}</p>}
                            <LoadingButton onClick={handleSavePreferences} isLoading={isLoading.preferences} variant="primary"> Save Preferences </LoadingButton>
                        </div>
                    </>
                 );
                 break;
             case 'Integrations':
                 content = (
                    <>
                      <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Integrations & Connections</h2>
                      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                         <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Broker Connections</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connect your broker accounts to automatically import trades.</p>
                         <div className="border border-dashed border-gray-300 dark:border-zinc-600 rounded-md p-6 text-center text-gray-500 dark:text-gray-400 mb-4"> No brokers connected yet. Feature coming soon! </div>
                          <LoadingButton disabled={true} variant="primary"> Add Broker Connection (Coming Soon) </LoadingButton>
                      </div>
                    </>
                 );
                 break;
             // case 'Subscription': content = ( <> ... Subscription placeholder ... </> ); break;
             case 'Data Management':
                 content = (
                    <>
                      <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Data Management</h2>
                      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                         <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Export Data</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Download a copy of all your trades and journal entries.</p>
                         <LoadingButton onClick={handleExportData} variant="secondary" disabled={true} > Export Data (CSV) (Coming Soon) </LoadingButton>
                      </div>
                      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 border border-red-300 dark:border-red-600/50">
                         <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Delete Account</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Permanently delete your account and all associated data. <strong className="font-semibold">This action is irreversible and cannot be undone.</strong> Any active subscriptions will NOT be automatically cancelled.</p>
                         <LoadingButton onClick={handleDeleteAccountAttempt} isLoading={isLoading.delete && (modalState.type === 'reauth-delete' || modalState.type === 'confirm-delete')} variant="danger" > Delete My Account Permanently </LoadingButton>
                      </div>
                    </>
                 );
                 break;
              case 'Help & Support':
                 content = (
                   <>
                     <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Help & Support</h2>
                      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                         <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Contact Us</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"> Have questions or need assistance? Reach out directly via email. Clicking below will open Gmail in a new tab. </p>
                          {/* UPDATED: Uses LoadingButton and onClick handler */}
                          <LoadingButton
                              onClick={handleEmailSupportClick}
                              variant="primary"
                              className="inline-flex items-center"
                          > Email Support (Opens Gmail) </LoadingButton>
                      </div>
                      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6 opacity-60">
                          <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">FAQ & Documentation</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Find answers to common questions and learn how to use the app features.</p>
                           <LoadingButton disabled={true} variant="secondary"> View Docs (Coming Soon) </LoadingButton>
                      </div>
                       <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8"> App Version: {import.meta.env.VITE_APP_VERSION || '1.0.0-dev'} </div>
                   </>
                 );
                 break;
             default:
                 content = <div>Select a category.</div>;
         }

        // CORRECTED: Final return uses AnimatePresence wrapper
        return (
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} variants={contentVariants} initial="hidden" animate="visible" exit="exit" >
                    {content}
                </motion.div>
            </AnimatePresence>
        );
    }, [activeTab, profileData, preferencesData, isLoading, error, isEditingName, tempDisplayName, user, contentVariants, formatDate, formatTime, handleAvatarChangeClick, handleAvatarUpload, handleCancelEditName, handleEditNameClick, handleSaveDisplayName, handleSignOut, handleChangePasswordAttempt, handleDeleteAccountAttempt, handleSavePreferences, handlePreferencesChange, fileInputRef, handleExportData, theme, handleEmailSupportClick /* Added new handler */ ]);


    // --- Render Modal Content ---
    const renderModalContent = useCallback(() => {
        switch(modalState.type) {
            case 'reauth-password':
            case 'reauth-delete':
                const isDeleting = modalState.type === 'reauth-delete';
                const passwordStrength = checkPasswordStrength(newPassword);
                return (
                     <form onSubmit={isDeleting ? handleReauthenticateAndConfirmDelete : handleReauthenticateAndChangePassword}>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"> For your security, please enter your current password to proceed. </p>
                         <PasswordInputField id="reauthPassword" label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required={true} className="mb-3"/>
                         {!isDeleting && (
                            <>
                                 <PasswordInputField id="newPassword" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required={true} className="mb-0"/>
                                 {newPassword && (
                                     <div className="mt-2 mb-3">
                                         <div className="h-2 w-full bg-gray-200 dark:bg-zinc-600 rounded-full overflow-hidden"> <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.widthPercent}%` }} ></div> </div>
                                         <p className={`text-xs mt-1 font-medium ${ passwordStrength.score < 3 ? 'text-red-500' : passwordStrength.score < 5 ? 'text-yellow-500' : 'text-green-500' }`} > Strength: {passwordStrength.label} </p>
                                     </div>
                                 )}
                                 <PasswordInputField id="confirmNewPassword" label="Confirm New Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required={true}/>
                            </>
                         )}
                         {error.reauth && <p className="text-red-500 text-xs mt-2 mb-3">{error.reauth}</p>}
                         {error.password && <p className="text-red-500 text-xs mt-1 mb-3">{error.password}</p>}
                         <div className="flex justify-end space-x-3 mt-5"> <LoadingButton type="button" variant="secondary" onClick={closeModal} disabled={isLoading.password}> Cancel </LoadingButton> <LoadingButton type="submit" variant={isDeleting ? "danger" : "primary"} isLoading={isLoading.password}> {isDeleting ? 'Authenticate' : 'Confirm Change'} </LoadingButton> </div>
                     </form>
                );
            case 'confirm-delete':
                // CORRECTED: Replaced placeholder with actual JSX
                return (
                     <div>
                         <p className="text-sm text-red-600 dark:text-red-400 mb-4 font-medium"> <AlertTriangle size={18} className="inline mr-1 mb-0.5" /> This action is final and irreversible! </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"> All your data associated with <strong>{user?.email}</strong> will be permanently deleted. Type <strong className="font-mono text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-1 py-0.5 rounded">DELETE</strong> below to confirm. </p>
                         <InputField id="deleteConfirm" label={`Type DELETE to confirm`} value={deleteConfirmationInput} onChange={(e) => setDeleteConfirmationInput(e.target.value)} required={true} className="font-mono" />
                         {error.delete && <p className="text-red-500 text-xs mt-1 mb-3">{error.delete}</p>}
                         <div className="flex justify-end space-x-3 mt-5"> <LoadingButton type="button" variant="secondary" onClick={closeModal} disabled={isLoading.delete}> Cancel </LoadingButton> <LoadingButton onClick={handleFinalDeleteAccount} variant="danger" isLoading={isLoading.delete} disabled={deleteConfirmationInput !== 'DELETE'} > Delete My Account </LoadingButton> </div>
                     </div>
                );
            default: return null;
        }
    }, [modalState.type, currentPassword, newPassword, confirmNewPassword, deleteConfirmationInput, error, isLoading, user?.email, handleReauthenticateAndConfirmDelete, handleReauthenticateAndChangePassword, closeModal, handleFinalDeleteAccount]);

    // --- Skeleton Loader ---
    const renderSkeletonLoader = () => (
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 animate-pulse">
            <div className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                <div className="flex flex-col space-y-1 bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md">
                    {tabs.map((tab) => ( <div key={tab.name} className="flex items-center gap-3 px-3 py-2.5 rounded-md"> <div className="h-5 w-5 bg-gray-200 dark:bg-zinc-700 rounded"></div> <SkeletonText className="h-4 w-2/3"/> </div> ))}
                </div>
            </div>
            <div className="flex-1 min-w-0 space-y-6">
                 <SkeletonText className="h-7 w-1/3 mb-5"/>
                 <SkeletonCard>
                     <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-zinc-700"> <SkeletonAvatar/> <div className="space-y-2 flex-1"> <SkeletonText className="h-5 w-1/4"/> <SkeletonText className="h-4 w-full"/> <SkeletonButton className="h-9 w-32 mt-2"/> </div> </div>
                      <div className="space-y-3 pt-2"> <SkeletonText className="h-4 w-1/5"/> <SkeletonInput/> <SkeletonText className="h-4 w-1/5"/> <SkeletonInput/> </div>
                 </SkeletonCard>
            </div>
        </div>
    );

    // --- Main Render ---
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-white">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-8 text-zinc-900 dark:text-white">Account Settings</h1>
                {isLoading.page ? renderSkeletonLoader() : (
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
                         {/* Tabs Nav */}
                         <div className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                             <nav className="flex flex-col space-y-1 bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md sticky top-6 md:top-10">
                                 {tabs.map((tab) => ( <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 focus:ring-offset-2 ${ activeTab === tab.name ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-gray-100' }`} > <tab.icon size={18} className={`flex-shrink-0 transition-colors duration-150 ${ activeTab === tab.name ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400' }`} aria-hidden="true" /> <span className="truncate">{tab.name}</span> </button> ))}
                             </nav>
                         </div>
                         {/* Content Area */}
                          <div className="flex-1 min-w-0"> {renderTabContent()} </div>
                    </div>
                )}
            </div>
             {/* Modal & Toast Rendering */}
             <Modal isOpen={modalState.isOpen} onClose={closeModal} title={ modalState.type === 'reauth-password' ? 'Change Password' : modalState.type === 'reauth-delete' ? 'Authenticate to Delete Account' : modalState.type === 'confirm-delete' ? 'Confirm Account Deletion' : '' }> {renderModalContent()} </Modal>
             <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({...prev, isVisible: false}))}/>
        </div>
    );
};

export default AccountPage;

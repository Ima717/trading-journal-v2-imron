import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, ShieldCheck, Settings, GitBranch, CreditCard, Database, HelpCircle,
    Eye, EyeOff, AlertTriangle, CheckCircle, X, Info, Loader2 // Icons
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Imports (Ensure paths are correct)
import { auth, db } from '../utils/firebase';
import {
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Context Hooks (Ensure paths are correct)
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Assuming this exists

// --- Tabs Configuration ---
const tabs = [
  { name: 'Profile', icon: User },
  { name: 'Security', icon: ShieldCheck },
  { name: 'Preferences', icon: Settings },
  { name: 'Integrations', icon: GitBranch },
  // NOTE: Uncomment or remove Subscription based on your app's features
  // { name: 'Subscription', icon: CreditCard },
  { name: 'Data Management', icon: Database },
  // { name: 'Help & Support', icon: HelpCircle }, // Optional
];

// --- Basic UI Helper Components ---

// Input Field
const InputField = ({ id, label, type = 'text', value, onChange, placeholder, disabled = false, required = false, className = '' }) => {
    const { theme } = useTheme(); // Use theme for styling if needed
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
    const darkFocusOffset = "dark:focus:ring-offset-zinc-800"; // Or dark:focus:ring-offset-gray-900 depending on exact bg

    const variants = {
        primary: `bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 ${darkFocusOffset} disabled:bg-indigo-400`,
        secondary: `border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-600 focus:ring-indigo-500 ${darkFocusOffset} disabled:opacity-50`,
        danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ${darkFocusOffset} disabled:bg-red-400`,
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseClasses} ${variants[variant]} ${isLoading || disabled ? 'cursor-not-allowed' : ''} ${className}`}
        >
            {isLoading ? (
                <>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-block" }}
                        className="mr-2"
                    >
                        <Loader2 size={18} />
                    </motion.div>
                    Processing...
                </>
            ) : (
                children
            )}
        </button>
    );
};

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    const { theme } = useTheme();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose} // Close on overlay click
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`relative w-full max-w-md rounded-lg shadow-xl overflow-hidden
                            ${theme === 'light' ? 'bg-white' : 'bg-zinc-800'}`}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Simple Toast Notification (State managed in parent)
const Toast = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertTriangle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />,
    };

    const colors = {
        success: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
        info: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`fixed bottom-5 right-5 z-50 w-full max-w-sm p-4 rounded-lg border shadow-lg ${colors[type] || colors.info}`}
            role="alert"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">{icons[type] || icons.info}</div>
                <div className="flex-1 text-sm font-medium mr-3">{message}</div>
                <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current" aria-label="Close">
                    <X size={18} />
                </button>
            </div>
        </motion.div>
    );
}

// --- Account Page Component ---
const AccountPage = () => {
    const { user } = useAuth(); // Get user from Auth context
    const { theme } = useTheme(); // Get theme
    const navigate = useNavigate();

    // --- State ---
    const [activeTab, setActiveTab] = useState(tabs[0].name);
    const [profileData, setProfileData] = useState({ displayName: '' });
    const [preferencesData, setPreferencesData] = useState({ defaultCurrency: 'USD' }); // Default values
    const [isLoading, setIsLoading] = useState({ page: true, profile: false, password: false, preferences: false, delete: false });
    const [error, setError] = useState({ profile: '', password: '', preferences: '', delete: '', reauth: '' });
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
    const [modalState, setModalState] = useState({ type: null, isOpen: false }); // type: 'reauth-password', 'reauth-delete', 'confirm-delete'
    const [currentPassword, setCurrentPassword] = useState(''); // For re-authentication
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

    // --- Utility Functions ---
    const showToast = (message, type = 'info', duration = 3000) => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => {
            setToast({ isVisible: false, message: '', type: 'info' });
        }, duration);
    };

    const setLoading = (key, value) => setIsLoading(prev => ({ ...prev, [key]: value }));
    const setErrorMessage = (key, message) => setError(prev => ({ ...prev, [key]: message }));
    const clearErrors = (...keys) => setError(prev => {
        const next = {...prev};
        keys.forEach(k => next[k] = '');
        return next;
    });

    const closeModal = () => {
        setModalState({ type: null, isOpen: false });
        // Clear sensitive form fields on modal close
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setDeleteConfirmationInput('');
        clearErrors('reauth', 'password', 'delete');
    };

    // --- Data Fetching ---
    const fetchUserData = useCallback(async () => {
        if (!user) {
            setIsLoading(prev => ({...prev, page: false}));
            return; // Exit if no user
        }
        setLoading('page', true);
        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfileData(prev => ({ ...prev, displayName: data.displayName || user.displayName || '' }));
                setPreferencesData(prev => ({ ...prev, ...data.preferences })); // Merge fetched preferences
            } else {
                // Document doesn't exist, use Auth profile data as default
                 setProfileData(prev => ({ ...prev, displayName: user.displayName || '' }));
                 console.log("No user document found in Firestore, using Auth profile.");
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            showToast("Failed to load user data.", "error");
            // Use Auth profile data as fallback on error
             setProfileData(prev => ({ ...prev, displayName: user.displayName || '' }));
        } finally {
            setLoading('page', false);
        }
    }, [user]); // Dependency on user object

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]); // Fetch data when user object changes

    // --- Event Handlers ---
    const handleProfileChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePreferencesChange = (e) => {
        setPreferencesData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Save Profile
    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading('profile', true);
        clearErrors('profile');
        const newName = profileData.displayName.trim();

        try {
            // 1. Update Firebase Auth profile
            if (newName !== (auth.currentUser.displayName || '')) {
                await updateProfile(auth.currentUser, { displayName: newName });
            }

            // 2. Update Firestore document (Create or Update)
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef,
                {
                    displayName: newName,
                    updatedAt: Timestamp.now() // Add timestamp
                },
                { merge: true } // Use merge to create or update fields
            );

            showToast("Profile updated successfully!", "success");
        } catch (err) {
            console.error("Error saving profile:", err);
            setErrorMessage('profile', `Failed to save profile: ${err.message}`);
            showToast("Failed to save profile.", "error");
        } finally {
            setLoading('profile', false);
        }
    };

    // Save Preferences
    const handleSavePreferences = async () => {
        if (!user) return;
        setLoading('preferences', true);
        clearErrors('preferences');

        try {
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef,
                {
                    preferences: preferencesData, // Save the whole preferences object
                    updatedAt: Timestamp.now()
                },
                { merge: true } // Use merge to create or update fields
            );
            showToast("Preferences saved successfully!", "success");
        } catch (err) {
             console.error("Error saving preferences:", err);
            setErrorMessage('preferences', `Failed to save preferences: ${err.message}`);
            showToast("Failed to save preferences.", "error");
        } finally {
            setLoading('preferences', false);
        }
    };

     // --- Re-authentication Logic ---
    const handleReauthenticate = async (password) => {
        if (!user || !password) {
             setErrorMessage('reauth', 'Password is required.');
            return false;
        }
        clearErrors('reauth');
        setLoading('password', true); // Use password loading state for re-auth

        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);
            setLoading('password', false);
            return true; // Re-authentication successful
        } catch (err) {
             console.error("Re-authentication error:", err);
             setErrorMessage('reauth', `Authentication failed: ${err.code === 'auth/wrong-password' ? 'Incorrect password.' : err.message}`);
             showToast("Authentication failed.", "error");
             setLoading('password', false);
             return false; // Re-authentication failed
        }
    };

    // --- Change Password Flow ---
    const handleChangePasswordAttempt = () => {
        // Open re-authentication modal specifically for password change
        setModalState({ type: 'reauth-password', isOpen: true });
    };

    const handleReauthenticateAndChangePassword = async (e) => {
        e.preventDefault(); // Prevent form submission if used in form
        clearErrors('password'); // Clear previous password specific errors

        // Basic validation
        if (newPassword !== confirmNewPassword) {
            setErrorMessage('password', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setErrorMessage('password', 'Password must be at least 6 characters long.');
            return;
        }

        const reauthenticated = await handleReauthenticate(currentPassword);

        if (reauthenticated) {
            // Proceed with password update
            try {
                 setLoading('password', true); // Ensure loading state is on
                 await updatePassword(auth.currentUser, newPassword);
                 setLoading('password', false);
                 closeModal();
                 showToast("Password updated successfully!", "success");
                 // Clear password fields after success
                 setNewPassword('');
                 setConfirmNewPassword('');
            } catch (err) {
                console.error("Error updating password:", err);
                setErrorMessage('password', `Failed to update password: ${err.message}`);
                showToast("Failed to update password.", "error");
                setLoading('password', false);
                // Keep modal open on failure? Or close? User preference. Let's keep it open for now.
            }
        }
        // If reauthentication failed, error is already shown by handleReauthenticate
    };


    // --- Delete Account Flow ---
    const handleDeleteAccountAttempt = () => {
        // Open re-authentication modal specifically for account deletion
         setModalState({ type: 'reauth-delete', isOpen: true });
    };

     const handleReauthenticateAndConfirmDelete = async (e) => {
        e.preventDefault();
        const reauthenticated = await handleReauthenticate(currentPassword);

        if (reauthenticated) {
            // Close re-auth modal, open final confirmation modal
            setModalState({ type: 'confirm-delete', isOpen: true });
        }
         // If reauthentication failed, error is already shown
    };

     const handleFinalDeleteAccount = async () => {
        if (deleteConfirmationInput !== 'DELETE') {
             setErrorMessage('delete', 'Type DELETE to confirm.');
            return;
        }
        if (!user) return;

        setLoading('delete', true);
        clearErrors('delete');

        try {
            // IMPORTANT: Ideally, trigger a Cloud Function here to delete associated Firestore/Storage data first.
            // This client-side deletion only removes the Auth user.
            await deleteUser(auth.currentUser);
            showToast("Account deleted successfully. You have been logged out.", "success", 5000);
            // No need to call signOut explicitly, deleteUser handles it.
            // AuthProvider's onAuthStateChanged will set user to null.
            // Navigate away after a short delay for toast visibility
            setTimeout(() => {
                 navigate('/signin'); // Or your logged-out page
                 closeModal(); // Close any modals
            }, 4000);
        } catch (err) {
             console.error("Error deleting account:", err);
             setErrorMessage('delete', `Failed to delete account: ${err.message}. Please try again or contact support.`);
             showToast("Failed to delete account.", "error");
             setLoading('delete', false);
        }
         // Don't reset loading state here if navigating away
    };


    // Placeholder for Export Data
    const handleExportData = () => {
      showToast("Data export feature is coming soon!", "info");
    };


    // --- Framer Motion Variants ---
    const contentVariants = useMemo(() => ({ // Memoize variants
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
    }), []);


    // --- Render Content Function ---
    const renderTabContent = () => {
        // Return loading indicator if page data is loading
        if (isLoading.page) {
            return (
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
            );
        }

        // Render content based on active tab
        let content;
        switch (activeTab) {
          case 'Profile':
            content = (
              <>
                <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Profile Information</h2>
                <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                    <InputField
                        id="displayName"
                        label="Display Name"
                        value={profileData.displayName}
                        onChange={handleProfileChange}
                        placeholder="Your name"
                    />
                    <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        value={user?.email || ''} // Display email from auth context
                        disabled // Make email read-only
                        className="mb-1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Email cannot be changed via this page.</p>

                    {/* TODO: Add Avatar Upload component/logic here */}

                    {error.profile && <p className="text-red-500 text-sm mt-2 mb-3">{error.profile}</p>}
                    <LoadingButton
                        onClick={handleSaveProfile}
                        isLoading={isLoading.profile}
                        variant="primary"
                    >
                        Save Profile Changes
                    </LoadingButton>
                </div>
              </>
            );
            break; // End Profile case

          case 'Security':
            content = (
              <>
                 <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Security Settings</h2>
                 {/* Card for Password */}
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Update your password regularly to keep your account secure.</p>
                    <LoadingButton
                         onClick={handleChangePasswordAttempt}
                         isLoading={isLoading.password && modalState.type === 'reauth-password'} // Show loading only if this action triggered reauth
                         variant="secondary"
                    >
                         Change Password
                    </LoadingButton>
                 </div>

                 {/* Card for 2FA (Placeholder) */}
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 opacity-60"> {/* Dimmed appearance */}
                    <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Add an extra layer of security using an authenticator app.</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Status: Not Available Yet</p>
                    <LoadingButton disabled={true} variant="primary">
                        Setup 2FA (Coming Soon)
                    </LoadingButton>
                 </div>

                 {/* TODO: Add Active Sessions section here */}
              </>
            );
            break; // End Security case

           case 'Preferences':
            content = (
               <>
                 <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Application Preferences</h2>
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                    {/* Appearance Theme Display */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-zinc-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appearance Theme</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Controlled via the toggle in the sidebar.</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{theme}</span>
                    </div>

                    {/* Default Currency Dropdown */}
                    <div className="mb-5">
                      <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Currency</label>
                      <select
                        id="defaultCurrency"
                        name="defaultCurrency" // Add name attribute
                        value={preferencesData.defaultCurrency} // Control value
                        onChange={handlePreferencesChange} // Add onChange handler
                        className="w-full md:w-1/2 p-2.5 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                         <option value="CAD">CAD - Canadian Dollar</option>
                         {/* Add other relevant currencies */}
                      </select>
                    </div>

                     {/* TODO: Add Timezone dropdown */}
                     {/* TODO: Add Notification Preferences (toggles/checkboxes) using ToggleSwitch component */}
                     {/* Example Toggle Placeholder */}
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-zinc-700 opacity-60">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summary Emails</label>
                             <p className="text-xs text-gray-500 dark:text-gray-400">Receive weekly performance summaries.</p>
                         </div>
                          {/* <ToggleSwitch disabled={true} /> Placeholder */}
                           <span className="text-xs font-medium text-gray-400 dark:text-gray-500">(Coming Soon)</span>
                      </div>


                     {error.preferences && <p className="text-red-500 text-sm mt-2 mb-3">{error.preferences}</p>}
                     <LoadingButton
                         onClick={handleSavePreferences}
                         isLoading={isLoading.preferences}
                         variant="primary"
                     >
                         Save Preferences
                     </LoadingButton>
                 </div>
               </>
            );
            break; // End Preferences case

          case 'Integrations':
            content = (
               <>
                 <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Integrations & Connections</h2>
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Broker Connections</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connect your broker accounts to automatically import trades.</p>
                    <div className="border border-dashed border-gray-300 dark:border-zinc-600 rounded-md p-6 text-center text-gray-500 dark:text-gray-400 mb-4">
                      No brokers connected yet. Feature coming soon!
                    </div>
                     <LoadingButton disabled={true} variant="primary">
                         Add Broker Connection (Coming Soon)
                     </LoadingButton>
                 </div>
                 {/* TODO: Add API Key Management section if you offer an API */}
               </>
            );
            break; // End Integrations case

          // case 'Subscription': // Uncomment if needed
          //   content = (
          //      <>
          //        <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Subscription & Billing</h2>
          //        <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
          //           <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Current Plan</h3>
          //           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You are currently on the <strong>Free Tier</strong>.</p>
          //           <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
          //             <li>Feature A</li>
          //             <li>Feature B</li>
          //           </ul>
          //           <LoadingButton disabled={true} variant="primary">
          //               Manage Subscription (Coming Soon)
          //           </LoadingButton>
          //        </div>
          //      </>
          //   );
          //   break;

          case 'Data Management':
            content = (
               <>
                 <h2 className="text-xl font-semibold mb-5 text-zinc-900 dark:text-white">Data Management</h2>
                 {/* Export Card */}
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium mb-2 text-zinc-900 dark:text-white">Export Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Download a copy of all your trades and journal entries.</p>
                    <LoadingButton
                         onClick={handleExportData}
                         variant="secondary"
                         disabled={true} // Enable when feature is ready
                    >
                         Export Data (CSV) (Coming Soon)
                    </LoadingButton>
                 </div>
                 {/* Delete Card */}
                 <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 border border-red-300 dark:border-red-600/50">
                    <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Delete Account</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Permanently delete your account and all associated data. <strong className="font-semibold">This action is irreversible and cannot be undone.</strong> Any active subscriptions will NOT be automatically cancelled.</p>
                    <LoadingButton
                         onClick={handleDeleteAccountAttempt}
                         isLoading={isLoading.delete && (modalState.type === 'reauth-delete' || modalState.type === 'confirm-delete')}
                         variant="danger"
                    >
                         Delete My Account Permanently
                    </LoadingButton>
                 </div>
               </>
            );
            break; // End Data Management case

          default:
            content = <div>Select a category.</div>;
        }

        // Wrap content in AnimatePresence for smooth transitions
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab} // Key change triggers animation
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {content}
                </motion.div>
            </AnimatePresence>
        );
    };

     // --- Render Modal Content ---
    const renderModalContent = () => {
        switch(modalState.type) {
            case 'reauth-password':
            case 'reauth-delete':
                const isDeleting = modalState.type === 'reauth-delete';
                return (
                     <form onSubmit={isDeleting ? handleReauthenticateAndConfirmDelete : handleReauthenticateAndChangePassword}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            For your security, please enter your current password to proceed.
                        </p>
                        <PasswordInputField
                             id="reauthPassword"
                             label="Current Password"
                             value={currentPassword}
                             onChange={(e) => setCurrentPassword(e.target.value)}
                             required={true}
                         />
                         {/* Show new password fields only when changing password */}
                         {!isDeleting && (
                            <>
                                 <PasswordInputField
                                     id="newPassword"
                                     label="New Password"
                                     value={newPassword}
                                     onChange={(e) => setNewPassword(e.target.value)}
                                     required={true}
                                 />
                                 <PasswordInputField
                                     id="confirmNewPassword"
                                     label="Confirm New Password"
                                     value={confirmNewPassword}
                                     onChange={(e) => setConfirmNewPassword(e.target.value)}
                                     required={true}
                                 />
                            </>
                         )}

                         {error.reauth && <p className="text-red-500 text-xs mt-1 mb-3">{error.reauth}</p>}
                         {error.password && <p className="text-red-500 text-xs mt-1 mb-3">{error.password}</p>}

                         <div className="flex justify-end space-x-3 mt-5">
                             <LoadingButton type="button" variant="secondary" onClick={closeModal} disabled={isLoading.password}>
                                 Cancel
                             </LoadingButton>
                             <LoadingButton type="submit" variant={isDeleting ? "danger" : "primary"} isLoading={isLoading.password}>
                                 {isDeleting ? 'Authenticate' : 'Confirm Change'}
                             </LoadingButton>
                         </div>
                     </form>
                );

            case 'confirm-delete':
                return (
                     <div>
                         <p className="text-sm text-red-600 dark:text-red-400 mb-4 font-medium">
                             <AlertTriangle size={18} className="inline mr-1 mb-0.5" /> This action is final and irreversible!
                         </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            All your data (trades, journals, settings) associated with <strong>{user?.email}</strong> will be permanently deleted.
                            Please type <strong className="font-mono text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-1 py-0.5 rounded">DELETE</strong> below to confirm.
                         </p>
                         <InputField
                             id="deleteConfirm"
                             label={`Type DELETE to confirm`}
                             value={deleteConfirmationInput}
                             onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                             required={true}
                             className="font-mono"
                         />
                         {error.delete && <p className="text-red-500 text-xs mt-1 mb-3">{error.delete}</p>}

                         <div className="flex justify-end space-x-3 mt-5">
                             <LoadingButton type="button" variant="secondary" onClick={closeModal} disabled={isLoading.delete}>
                                 Cancel
                             </LoadingButton>
                             <LoadingButton
                                 onClick={handleFinalDeleteAccount}
                                 variant="danger"
                                 isLoading={isLoading.delete}
                                 disabled={deleteConfirmationInput !== 'DELETE'} // Disable if not typed correctly
                             >
                                 Delete My Account
                             </LoadingButton>
                         </div>
                     </div>
                );
            default:
                return null;
        }
    };

    // --- Main Render ---
    return (
    // Main page container - Adjust background/padding to match your app's layout
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"> {/* Responsive padding */}
        {/* Page Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-zinc-900 dark:text-white">Account Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Vertical Tabs Navigation */}
            <div className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
                <nav className="flex flex-col space-y-1 bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md sticky top-6"> {/* Sticky nav */}
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 focus:ring-offset-2 ${
                            activeTab === tab.name
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200' // Slightly different active style
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-gray-100'
                        }`}
                    >
                        <tab.icon size={18} className={`flex-shrink-0 transition-colors duration-150 ${
                            activeTab === tab.name
                            ? 'text-indigo-600 dark:text-indigo-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                            }`} aria-hidden="true" />
                        <span className="truncate">{tab.name}</span>
                    </button>
                ))}
                </nav>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 min-w-0"> {/* Added min-w-0 for flexbox wrapping issues */}
                {renderTabContent()}
            </div>
        </div>
        </div>

        {/* Modal Rendering */}
        <Modal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={
                modalState.type === 'reauth-password' ? 'Change Password' :
                modalState.type === 'reauth-delete' ? 'Authenticate to Delete Account' :
                modalState.type === 'confirm-delete' ? 'Confirm Account Deletion' : ''
            }
        >
            {renderModalContent()}
        </Modal>

        {/* Toast Notification */}
        <Toast
            isVisible={toast.isVisible}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({...prev, isVisible: false}))}
        />
    </div>
    );
};

export default AccountPage;

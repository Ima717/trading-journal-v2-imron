import React, { useState } from 'react';
import { User, ShieldCheck, Settings, GitBranch, CreditCard, Database, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
// TODO: Import useAuth hook if needed for user data display/updates
// import { useAuth } from '../context/AuthContext';
// TODO: Import useTheme if needed to display current theme status
// import { useTheme } from '../context/ThemeContext';

// Define the tabs for the account page
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

const AccountPage = () => {
  // TODO: Get user info if needed, e.g., const { user } = useAuth();
  // TODO: Get theme info if needed, e.g., const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(tabs[0].name); // Default to the first tab

  // Placeholder function for saving profile - replace with actual logic
  const handleSaveProfile = () => {
    console.log("Placeholder: Save Profile clicked");
    // Add logic to update user profile in Firebase/backend
    alert("Profile saving not implemented yet.");
  };

  // Placeholder function for changing password - replace with actual logic/modal
   const handleChangePassword = () => {
     console.log("Placeholder: Change Password clicked");
     alert("Password change functionality not implemented yet.");
     // Typically opens a modal requiring current and new password
   };

   // Placeholder function for 2FA setup - replace with actual logic/modal
   const handleSetup2FA = () => {
     console.log("Placeholder: Setup 2FA clicked");
     alert("2FA setup not implemented yet.");
     // Typically opens a modal for QR code scanning / setup steps
   };

   // Placeholder function for Export Data - replace with actual logic
   const handleExportData = () => {
     console.log("Placeholder: Export Data clicked");
     alert("Data export functionality not implemented yet.");
     // Add logic to generate and download user data (e.g., trades as CSV)
   };

   // Placeholder function for Delete Account - replace with actual logic/modal
    const handleDeleteAccount = () => {
      console.log("Placeholder: Delete Account clicked");
      // IMPORTANT: This should open a confirmation modal requiring password input
      // and clearly stating the permanent consequences.
      if (window.confirm("Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.")) {
         if (window.prompt("To confirm, please type DELETE below:") === "DELETE") {
            alert("Account deletion not implemented yet. This is a placeholder confirmation.");
            // Add actual Firebase/backend logic for account deletion here
         } else {
            alert("Deletion cancelled or confirmation failed.");
         }
      }
    };

  // Function to render the content based on the active tab
  const renderTabContent = () => {
    // Animation variants for content fade-in
    const contentVariants = {
       hidden: { opacity: 0, y: 10 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
     };

    switch (activeTab) {
      case 'Profile':
        return (
          <motion.div variants={contentVariants} initial="hidden" animate="visible">
            <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Profile Information</h2>
            {/* Card for Profile */}
            <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
              {/* Example: Display Name Input */}
              <div className="mb-4">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  // TODO: Replace defaultValue with actual user data from useAuth() or state
                  defaultValue={"User's Placeholder Name"}
                  className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 text-zinc-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  // TODO: Add onChange handler to update state for saving
                />
              </div>
              {/* Example: Email Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                {/* TODO: Replace with actual user email from useAuth() */}
                <p className="text-zinc-800 dark:text-white p-2 border border-transparent rounded-md bg-gray-50 dark:bg-zinc-700">{'user@placeholder.com'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed currently.</p>
                {/* TODO: Or add "Change Email" button/logic if needed (requires verification) */}
              </div>
              {/* TODO: Add Avatar Upload component/logic here */}
               <button
                  onClick={handleSaveProfile}
                  className="mt-4 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 transition duration-200"
               >
                 Save Profile Changes
               </button>
            </div>
          </motion.div>
        );
      case 'Security':
        return (
          <motion.div variants={contentVariants} initial="hidden" animate="visible">
            <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Security Settings</h2>
            {/* Card for Password */}
            <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
               <h3 className="text-lg font-medium mb-3 text-zinc-800 dark:text-white">Password</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Update your password regularly to keep your account secure.</p>
               <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-300 dark:border-indigo-500 text-sm font-medium rounded-md hover:bg-indigo-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 transition duration-200"
                >
                 Change Password
               </button>
             </div>
            {/* Card for 2FA */}
             <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
               <h3 className="text-lg font-medium mb-3 text-zinc-800 dark:text-white">Two-Factor Authentication (2FA)</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Add an extra layer of security using an authenticator app.</p>
               {/* TODO: Display current 2FA status (Enabled/Disabled) */}
               <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-3">Status: Disabled</p>
               <button
                  onClick={handleSetup2FA}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 transition duration-200"
               >
                 Setup 2FA
               </button>
               {/* TODO: If 2FA is enabled, show a "Disable 2FA" button instead */}
             </div>
            {/* TODO: Add Active Sessions section here */}
          </motion.div>
        );
      case 'Preferences':
         return (
           <motion.div variants={contentVariants} initial="hidden" animate="visible">
             <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Application Preferences</h2>
              <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                 {/* Example: Theme Display (controlled by sidebar toggle) */}
                 <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-zinc-700">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appearance Theme</label>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Theme is controlled via the toggle in the sidebar.</p>
                   </div>
                    {/* TODO: Read current theme from useTheme() */}
                   <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">Dark</span>
                 </div>
                 {/* TODO: Add Default Currency dropdown */}
                  <div className="mb-4">
                      <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Currency</label>
                      <select
                          id="defaultCurrency"
                          className="w-full md:w-1/2 p-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 text-zinc-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                          // TODO: Add value and onChange handler
                      >
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                          {/* Add other currencies */}
                      </select>
                  </div>
                 {/* TODO: Add Timezone dropdown */}
                 {/* TODO: Add Notification Preferences (toggles/checkboxes) */}
                  <button className="mt-4 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 transition duration-200">
                    Save Preferences
                  </button>
              </div>
           </motion.div>
         );
      case 'Integrations':
         return (
           <motion.div variants={contentVariants} initial="hidden" animate="visible">
             <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Integrations & Connections</h2>
              <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                 <h3 className="text-lg font-medium mb-3 text-zinc-800 dark:text-white">Broker Connections</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connect your broker accounts to automatically import trades (Feature coming soon!).</p>
                 {/* TODO: Replace with actual list of connections and Add/Remove logic */}
                 <div className="border border-dashed border-gray-300 dark:border-zinc-600 rounded-md p-4 text-center text-gray-500 dark:text-gray-400 mb-4">
                    No brokers connected yet.
                 </div>
                  <button
                    disabled // Disable button until feature is ready
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Broker Connection
                  </button>
              </div>
              {/* TODO: Add API Key Management section if you offer an API */}
           </motion.div>
         );
       case 'Subscription': // NOTE: Only include if you have subscription plans
         return (
           <motion.div variants={contentVariants} initial="hidden" animate="visible">
             <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Subscription & Billing</h2>
              <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
                 <h3 className="text-lg font-medium mb-3 text-zinc-800 dark:text-white">Current Plan</h3>
                  {/* TODO: Replace with dynamic data based on user's subscription */}
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You are currently on the <strong>Free Tier</strong>.</p>
                 <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
                     <li>Max 50 Trades per month</li>
                     <li>Basic Analytics</li>
                     <li>Community Support</li>
                 </ul>
                 {/* TODO: Add Billing History link, Payment Method management (via Stripe/Paddle redirect ideally) */}
                 <button
                    // TODO: Link to your pricing/upgrade page
                    className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition duration-200"
                  >
                    Explore Premium Plans
                  </button>
              </div>
           </motion.div>
         );
       case 'Data Management':
         return (
           <motion.div variants={contentVariants} initial="hidden" animate="visible">
             <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-white">Data Management</h2>
              {/* Card for Export */}
             <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 mb-6">
               <h3 className="text-lg font-medium mb-3 text-zinc-800 dark:text-white">Export Data</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Download a copy of all your trades and journal entries.</p>
               <button
                  onClick={handleExportData}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-300 dark:border-indigo-500 text-sm font-medium rounded-md hover:bg-indigo-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 transition duration-200"
                >
                 Export Data (CSV)
               </button>
             </div>
              {/* Card for Delete */}
             <div className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6 border border-red-300 dark:border-red-600">
               <h3 className="text-lg font-medium mb-3 text-red-600 dark:text-red-400">Delete Account</h3>
               <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Permanently delete your account and all associated data, including trades, journal entries, and settings. <strong className="font-semibold">This action cannot be undone.</strong></p>
               <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-zinc-800 transition duration-200"
               >
                 Delete My Account Permanently
               </button>
             </div>
           </motion.div>
         );
      // TODO: Add 'Help & Support' case if included in tabs array
      default:
        return <motion.div variants={contentVariants} initial="hidden" animate="visible">Select a category from the left.</motion.div>;
    }
  };

  return (
    // Main page container - Mimic Dashboard page structure for consistency
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-inter text-zinc-800 dark:text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6"> {/* Responsive padding */}
        {/* Page Header */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Account Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8"> {/* Responsive gap */}
          {/* Vertical Tabs Navigation - Adjusted width and responsive behavior */}
          <div className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
            <nav className="flex flex-col space-y-1 bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md sticky top-6"> {/* Sticky nav */}
              {tabs.map((tab) => (
                // Example: Conditionally render subscription tab if needed
                // {tab.name === 'Subscription' && !userHasSubscriptionFeature ? null : (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-800 focus:ring-offset-2 ${
                    activeTab === tab.name
                      ? 'bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <tab.icon size={18} className={`flex-shrink-0 ${
                      activeTab === tab.name ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400' // Adjusted group hover color
                    }`} aria-hidden="true" />
                  <span className="truncate">{tab.name}</span>
                </button>
                // )}
              ))}
            </nav>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 min-w-0"> {/* Added min-w-0 for flexbox wrapping issues */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

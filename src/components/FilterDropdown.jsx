import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const FilterDropdown = ({ filters, setFilters }) => {
  const { user } = useAuth();
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "trades");
      const snapshot = await getDocs(ref);
      const tagsSet = new Set();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.tags)) {
          data.tags.forEach((tag) => tagsSet.add(tag));
        }
      });
      setAllTags(Array.from(tagsSet));
    };
    fetchTags();
  }, [user]);

  const toggleTag = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setFilters({ ...filters, tags: newTags });
  };

  return (
    <div className="relative">
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Filter by Tag</div>
      <div className="border rounded-md bg-white dark:bg-zinc-800 px-3 py-2 w-64 text-sm shadow-sm">
        {allTags.length === 0 && <div className="text-gray-400">No tags found</div>}
        {allTags.map((tag) => (
          <label key={tag} className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={filters.tags.includes(tag)}
              onChange={() => toggleTag(tag)}
              className="accent-blue-500"
            />
            <span className="text-gray-800 dark:text-gray-200">{tag}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterDropdown;

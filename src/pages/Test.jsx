import React, { useEffect } from "react";

const Test = () => {
  useEffect(() => {
    console.log("✅ Test page is mounted");
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">🧪 This is the test page</h1>
    </div>
  );
};

export default Test;

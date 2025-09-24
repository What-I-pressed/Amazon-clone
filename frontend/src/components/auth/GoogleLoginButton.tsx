import React from "react";

const GoogleLoginButton: React.FC = () => {
  const handleLogin = () => {
    // редірект на бекенд
    window.location.href = "https://localhost:5001/auth/google";
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Увійти через Google
    </button>
  );
};

export default GoogleLoginButton;

import React, { useState } from "react";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";

const App = () => {
  const [currentPage, setCurrentPage] = useState<"signin" | "signup">("signin");

  const handleSignIn = (email: string, role: string) => {
    console.log("User signed in:", { email, role });
  };

  const handleSignUp = (email: string, role: string) => {
    console.log("User signed up:", { email, role });
    setCurrentPage("signin");
  };

  return (
    <div className="App">
      {currentPage === "signin" ? (
        <SignIn
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setCurrentPage("signup")}
        />
      ) : (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setCurrentPage("signin")}
        />
      )}
    </div>
  );
};

export default App;

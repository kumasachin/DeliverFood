import React from "react";
import { SignIn } from "./components/Auth/SignIn";

const App = () => {
  const handleSignIn = (email: string, role: string) => {
    console.log("User signed in:", { email, role });
  };

  return (
    <div className="App">
      <SignIn onSignIn={handleSignIn} />
    </div>
  );
};

export default App;

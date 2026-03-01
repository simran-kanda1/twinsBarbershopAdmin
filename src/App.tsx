import { useEffect, useState } from "react";
import { LeadsManager } from "./components/LeadsManager";
import { Login } from "./components/Login";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-400 animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => { }} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-500/30">
      <div className="w-full bg-zinc-950 border-b border-white/5 py-4 px-8 flex justify-end items-center sticky top-0 z-50">
        <button
          onClick={() => signOut(auth)}
          className="text-sm font-medium text-zinc-400 hover:text-rose-400 transition-colors bg-zinc-900/50 hover:bg-rose-500/10 px-4 py-2 rounded-lg border border-white/5"
        >
          Sign out
        </button>
      </div>
      <div className="flex-1">
        <LeadsManager />
      </div>
    </div>
  );
}

export default App;

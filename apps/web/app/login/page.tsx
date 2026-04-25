import { loginAction } from '../actions/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-8 font-sans">
      <form action={loginAction} className="flex flex-col gap-6 w-full max-w-sm p-8 rounded-2xl border border-zinc-900 bg-zinc-900/50 shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Corporate Portal</h1>
          <p className="text-zinc-500 text-sm">Please identify yourself to access the inventory.</p>
        </div>
        
        <div className="space-y-4">
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            required 
            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-zinc-100 placeholder:text-zinc-700 outline-none focus:border-zinc-500 transition-colors" 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            required 
            className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-zinc-100 placeholder:text-zinc-700 outline-none focus:border-zinc-500 transition-colors" 
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-zinc-50 text-zinc-950 p-3 rounded-lg font-bold hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Login
        </button>
      </form>
    </div>
  );
}

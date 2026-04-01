import { useNavigate } from "react-router-dom";
import { PlusIcon, FolderPlusIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartEmpty = () => {
    const roomId = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${roomId}`);
  };

  const handleUploadFolder = () => {
    // Navigate straight to the editor and immediately prompt for folder selection there
    // This avoids double-prompting the user and bypasses Brave's strict permission limits on landing pages
    const roomId = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${roomId}`, { state: { triggerUpload: true } });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 flex flex-col font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3333332e_1px,transparent_1px),linear-gradient(to_bottom,#3333332e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Nav */}
      <nav className="relative z-10 w-full flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-semibold text-lg tracking-tight text-neutral-300">
          <div className="w-6 h-6 bg-neutral-300 rounded-sm flex items-center justify-center shadow-lg">
            <span className="text-neutral-950 text-xs font-bold mr-[1px]">C</span>
          </div>
          ColabCode
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-neutral-500 hover:text-neutral-300 transition-colors">Documentation</a>
          <a href="#" className="text-sm font-medium text-neutral-500 hover:text-neutral-300 transition-colors">GitHub</a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center -mt-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full flex flex-col items-center text-center space-y-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium tracking-[0.15em] uppercase shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            V1.0 Live Collaboration
          </motion.div>
          
          <h1 className="text-5xl sm:text-7xl md:text-[6.5rem] font-medium tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-600">
            Build software <br className="hidden sm:block" /> together.
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto font-light tracking-tight leading-relaxed">
            The offline-first IDE native to your browser. Start a blank canvas or auto-sync your local codebase instantly. No containers, no waiting.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl pt-12">
            {/* Card 1: Start Empty */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartEmpty}
              className="group relative flex items-start flex-col p-8 rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 hover:bg-neutral-800/50 hover:border-neutral-700 transition-all duration-300 w-full text-left overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-blue-400 group-hover:bg-neutral-700/50 group-hover:border-neutral-600 transition-all duration-300">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-neutral-200">Start Scratchpad</h3>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                Spin up a lightning-fast single file editor session to share snippets, notes, or ideas.
              </p>
            </motion.button>

            {/* Card 2: Upload */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUploadFolder}
              className="group relative flex items-start flex-col p-8 rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 hover:bg-neutral-800/50 hover:border-neutral-700 transition-all duration-300 w-full text-left overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-purple-400 group-hover:bg-neutral-700/50 group-hover:border-neutral-600 transition-all duration-300">
                  <FolderPlusIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium tracking-tight text-neutral-200">Upload Codebase</h3>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed font-normal">
                Sync a local directory directly to the cloud session using the secure File System API.
              </p>
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[30vh] bg-blue-500/5 blur-[120px] pointer-events-none rounded-t-full" />
    </div>
  );
};

export default LandingPage;

import { v4 as uuidV4 } from "uuid";
import Navbar from "./components/navbar";
import { useNavigate } from "react-router-dom";
import { FileText ,Share2, Users } from "lucide-react";
import {motion} from "framer-motion";



function Home() {
    const navigate = useNavigate();
   
    const createNewDoc = () => {
      
        const id = uuidV4();
        navigate(`/doc/${id}`);
};

 return (
    // <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f0f0f] to-[#1a1a2e] transition-all duration-200 hover:scale-105 text-white">

    //   {/* Navbar */}
    //   <div className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
    //     <h1 className="text-xl font-semibold">SyncPad</h1>
    //     <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg" onClick = {createNewDoc}>
    //       New Document
    //     </button>
    //   </div>

    //   {/* Hero Section */}
    //   <div className="flex flex-col justify-center items-center flex-1 text-center px-4">
        
    //     <h1 className="text-5xl font-bold mb-4 ">
    //       Write. Collaborate. Share.
    //     </h1>

    //     <p className="text-gray-400 mb-6 max-w-xl ">
    //       A real-time collaborative editor like Google Docs.
    //       Work with your team instantly from anywhere.
    //     </p>

    //     <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg mt-4">
    //       Start Writing
    //     </button>
    //   </div>

    // </div>


   <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-[#0b0b0f] text-white">

 {/* Navbar */}
      <Navbar onCreate={createNewDoc} />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent blur-3xl"></div>

      {/* Floating Glow */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-blue-500 opacity-10 blur-[120px] rounded-full top-[-150px]"
      />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold leading-tight mb-6"
      >
        Build Documents <br />
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Together. Instantly.
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 max-w-2xl text-lg mb-8"
      >
        Experience real-time collaboration like never before.
        Write, edit, and share documents with your team — live.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        <button  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3
         rounded-xl text-lg transition hover:scale-105 relative z-10" onClick = {createNewDoc}>
          <FileText size={18} />
          Start Writing
        </button>

        <button className="flex items-center gap-2 border border-gray-600 px-6 py-3 rounded-xl hover:bg-gray-800 transition">
          <Share2 size={18} />
          Live Demo
        </button>
      </motion.div>

      {/* Collaboration Avatars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-3 mt-6"
      >
        <div className="flex -space-x-3">
          <img className="w-8 h-8 rounded-full border border-black" src="https://i.pravatar.cc/40?img=1" />
          <img className="w-8 h-8 rounded-full border border-black" src="https://i.pravatar.cc/40?img=2" />
          <img className="w-8 h-8 rounded-full border border-black" src="https://i.pravatar.cc/40?img=3" />
        </div>
        <p className="text-sm text-gray-400">3 people editing right now</p>
      </motion.div>

      {/* Editor Preview */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-16 w-full max-w-5xl bg-[#12121a] border border-gray-800 rounded-2xl shadow-2xl p-6 backdrop-blur-lg"
      >

        {/* Top bar */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400 text-sm">Untitled Document</p>
          <div className="flex gap-2">
            <Users size={18} className="text-gray-400" />
            <Share2 size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Fake Editor Content */}
        <div className="text-left space-y-3 text-gray-300">
          <p className="text-xl font-semibold text-white">Project Plan 🚀</p>
          <p>• Build real-time editor using WebSockets</p>
          <p>• Add collaboration with multiple users</p>
          <p className="opacity-60">User typing...</p>
        </div>
      </motion.div>

      {/* Trust Badge */}
      <p className="text-xs text-gray-500 mt-6">
        Powered by WebSockets • Built with MERN ⚡
      </p>

    </div>
  );
}
  
  // <button onClick = {createNewDoc}> new Document </button>


export default Home ;
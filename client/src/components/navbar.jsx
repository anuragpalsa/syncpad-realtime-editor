import { FileText, Plus } from "lucide-react";


export default function Navbar({ onCreate }) {
  return (
    <div className="w-full flex items-center justify-between px-8 py-4 mb-15 border-b border-gray-800 bg-[#0b0b0f] text-white">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <FileText className="text-blue-500" />
        <h1 className="text-3xl font-semiBold">SyncPad</h1>
      </div>

      {/* Right Side */}
      <button
        onClick={onCreate}
        className="flex items-center relative z-10 gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
      >
        <Plus size={18} />
        New Document
      </button>

    </div>
  );
}
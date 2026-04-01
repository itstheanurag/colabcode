import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { MonacoBinding } from "y-monaco";
import { IndexeddbPersistence } from "y-indexeddb";
import { 
    ArrowLeftIcon, 
    ShareIcon, 
    Squares2X2Icon, 
    DocumentTextIcon, 
    FolderPlusIcon, 
    ArrowPathIcon
} from "@heroicons/react/20/solid";
import FileExplorer from "../components/FileExplorer";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_SOCKET_SERVER_URL = "http://localhost:3001";
const SOCKET_PATH = "/socket.io/";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef<any>(null);
  const providerRef = useRef<SocketIOProvider | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(1);
  const [activeFile, setActiveFile] = useState<string>("main.js");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fileList, setFileList] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yfiles = useMemo(() => ydoc.getMap<Y.Text>("files"), [ydoc]);
  
  useEffect(() => {
    const updateFileList = () => {
      setFileList(Array.from(yfiles.keys()));
    };
    yfiles.observe(updateFileList);
    updateFileList();
    return () => yfiles.unobserve(updateFileList);
  }, [yfiles]);

  const fileTree = useMemo(() => {
    if (fileList.length === 0) {
        return [{ name: "main.js", path: "main.js", type: "file" as const }];
    }
    const root: FileNode[] = [];
    [...fileList].sort().forEach(path => {
        const parts = path.split('/');
        let currentLevel = root;
        parts.forEach((part, i) => {
            const isLast = i === parts.length - 1;
            let node = currentLevel.find(n => n.name === part);
            if (!node) {
                node = {
                    name: part,
                    path: parts.slice(0, i + 1).join('/'),
                    type: isLast ? "file" : "directory",
                    children: isLast ? undefined : []
                };
                currentLevel.push(node);
            }
            if (!isLast && node.children) currentLevel = node.children;
        });
    });
    return root;
  }, [fileList]);

  useEffect(() => {
    if (!roomId) return;
    const socketServerUrl = import.meta.env.VITE_SOCKET_SERVER_URL ?? DEFAULT_SOCKET_SERVER_URL;
    const persistence = new IndexeddbPersistence(roomId, ydoc);
    const provider = new SocketIOProvider(socketServerUrl, roomId, ydoc, { autoConnect: true }, { path: SOCKET_PATH });
    providerRef.current = provider;

    provider.on("status", ({ status }: { status: string }) => setIsConnected(status === "connected"));
    provider.awareness.on("change", () => setUserCount(provider.awareness.getStates().size));

    // Wait until mounted to trigger upload to avoid security/policy blocks
    if (location.state?.triggerUpload) {
      setShowUploadPrompt(true);
      window.history.replaceState({}, document.title);
    }
    
    return () => { provider.destroy(); persistence.destroy(); };
  }, [ydoc, roomId, location.state]);

  const handleDirectorySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setShowUploadPrompt(false);
    setIsUploading(true);
    
    try {
      // Process files using webkit directory selection which is universally supported (including Brave)
      ydoc.transact(() => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Skip enormous binary / hidden files if necessary, but we'll accept all for now
          if (file.size > 10 * 1024 * 1024) continue; // Skip files > 10MB to prevent crashing browser
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            const ytext = new Y.Text();
            ytext.insert(0, content);
            // webkitRelativePath contains the full folder structure (e.g. project/src/main.js)
            yfiles.set(file.webkitRelativePath || file.name, ytext);
          };
          reader.readAsText(file);
        }
      });
      
      setTimeout(() => {
        const keys = Array.from(yfiles.keys());
        if (keys.length > 0) setActiveFile(keys[0]);
        setIsUploading(false);
      }, 1000); // Give transaction time to apply
      
    } catch (err) {
      console.error("Upload failed", err);
      setIsUploading(false);
    }
  };

  const triggerUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    const provider = providerRef.current;
    if (!editor || !provider) return;
    let ytext = yfiles.get(activeFile);
    if (!ytext) { ytext = new Y.Text(); yfiles.set(activeFile, ytext); }
    const model = editor.getModel();
    if (!model) return;
    const monacoBinding = new MonacoBinding(ytext, model, new Set([editor]), provider.awareness);
    return () => monacoBinding.destroy();
  }, [activeFile, editorRef.current, yfiles]);

  const handleMount: OnMount = (editor) => { editorRef.current = editor; };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert("Copied to clipboard!"); };

  const inputProps: any = { webkitdirectory: "true", directory: "true" };

  return (
    <div className="h-screen w-full flex flex-col bg-neutral-950 text-sm">
      {/* Hidden universal directory upload input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        multiple 
        {...inputProps}
        onChange={handleDirectorySelect} 
      />

      <AnimatePresence>
        {isUploading && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4"
            >
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
                <div className="text-lg font-medium tracking-tight text-neutral-200">Syncing Project</div>
            </motion.div>
        )}
        
        {showUploadPrompt && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center"
            >
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-sm w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-blue-400">
                        <FolderPlusIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-medium tracking-tight text-neutral-200 mb-2">Select Codebase</h2>
                        <p className="text-sm text-neutral-500">Session created perfectly. Please select your local folder to sync it with this room.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowUploadPrompt(false)} className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-300 font-medium border border-neutral-700">Cancel</button>
                        <button onClick={triggerUploadClick} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium">Select Folder</button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <header className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-neutral-800 rounded transition-colors text-neutral-400">
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="font-medium text-[10px] text-neutral-500 uppercase tracking-widest">Room: {roomId}</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                <span className="text-[10px] text-neutral-400 font-bold uppercase">{userCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={triggerUploadClick} className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors">
            <FolderPlusIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 transition-colors ${sidebarOpen ? 'text-blue-400' : 'text-neutral-400 hover:text-neutral-200'}`}>
            <Squares2X2Icon className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-neutral-800 mx-2" />
          <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-500 py-1.5 px-3 text-xs flex items-center gap-1.5 rounded-md font-medium text-white transition-colors">
            <ShareIcon className="w-3.5 h-3.5" /> <span>Share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="w-56 border-r border-neutral-800 bg-neutral-950 flex-shrink-0 flex flex-col">
            <FileExplorer files={fileTree} activeFile={activeFile} onFileSelect={setActiveFile} />
          </aside>
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-8 bg-neutral-900/40 border-b border-neutral-800 flex items-center px-4 gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-[11px] text-blue-400 font-medium uppercase tracking-wider h-full border-b border-blue-500">
                <DocumentTextIcon className="w-3.5 h-3.5" />
                <span>{activeFile?.split('/').pop()}</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              path={activeFile}
              theme="vs-dark"
              onMount={handleMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 20,
                padding: { top: 12 },
                fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'all',
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorPage;

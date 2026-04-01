import React from "react";
import { FolderIcon, ChevronRightIcon, ChevronDownIcon, DocumentTextIcon } from "@heroicons/react/20/solid";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  activeFile: string | null;
  onFileSelect: (path: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onFileSelect }) => {
  return (
    <div className="h-full w-full overflow-y-auto py-3 no-scrollbar">
      <div className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">
        Explorer
      </div>
      <div className="space-y-0.5">
        {files.map((node) => (
          <FileNodeItem 
            key={node.path} 
            node={node} 
            activeFile={activeFile} 
            onFileSelect={onFileSelect} 
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};

const FileNodeItem: React.FC<{
  node: FileNode;
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  depth: number;
}> = ({ node, activeFile, onFileSelect, depth }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isActive = activeFile === node.path;

  const toggle = (e: React.MouseEvent) => {
    if (node.type === "directory") {
      e.stopPropagation();
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div 
        onClick={toggle}
        style={{ paddingLeft: `${depth * 10 + 12}px` }}
        className={`flex items-center gap-2 py-1 cursor-pointer transition-all text-xs ${
          isActive 
            ? "bg-white/5 text-blue-400 border-l-2 border-blue-500" 
            : "hover:bg-white/[0.03] text-neutral-400"
        }`}
      >
        {node.type === "directory" ? (
          <>
            <div className="w-3 h-3 flex items-center justify-center">
                {isOpen ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
            </div>
            <FolderIcon className={`w-3.5 h-3.5 ${isOpen ? "text-blue-500/60" : "text-neutral-500"}`} />
          </>
        ) : (
          <>
            <div className="w-3" />
            <DocumentTextIcon className={`w-3.5 h-3.5 ${isActive ? "text-blue-500/80" : "text-neutral-500"}`} />
          </>
        )}
        <span className="truncate flex-1 pr-2">{node.name}</span>
      </div>
      
      {node.type === "directory" && isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <FileNodeItem 
              key={child.path} 
              node={child} 
              activeFile={activeFile} 
              onFileSelect={onFileSelect} 
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;

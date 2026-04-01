import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { MonacoBinding } from "y-monaco";

const DEFAULT_SOCKET_SERVER_URL = "http://localhost:3001";
const SOCKET_PATH = "/socket.io/";
const ROOM_NAME = "monaco";

function App() {
  const [editor, setEditor] = useState<any>(null);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);
  const providerRef = useRef<SocketIOProvider | null>(null);

  useEffect(() => {
    const socketServerUrl =
      import.meta.env.VITE_SOCKET_SERVER_URL ?? DEFAULT_SOCKET_SERVER_URL;

    console.log("Initializing SocketIOProvider for room:", ROOM_NAME);
    const provider = new SocketIOProvider(
      socketServerUrl,
      ROOM_NAME,
      ydoc,
      {
        autoConnect: true,
      },
      {
        path: SOCKET_PATH,
      },
    );
    providerRef.current = provider;

    // provider.on("status", (event: any) => {
    //   console.log("SocketIOProvider status:", event.status);
    // });

    // provider.on("connection-close", (event: any) => {
    //   console.warn("SocketIOProvider connection-close:", event);
    // });

    // provider.on("connection-error", (event: any) => {
    //   console.error("SocketIOProvider connection-error:", event);
    // });

    // provider.socket.on("connect", () => {
    //   console.log("Socket.io connected:", provider.socket.id);
    // });

    // provider.socket.on("connect_error", (err: any) => {
    //   console.error("Socket.io connect_error:", err.message, err);
    // });

    // provider.socket.on("disconnect", (reason: any) => {
    //   console.warn("Socket.io disconnect reason:", reason);
    // });

    return () => {
      console.log("Cleaning up SocketIOProvider");
      providerRef.current = null;
      provider.destroy();
    };
  }, [ydoc]);

  useEffect(() => {
    const provider = providerRef.current;
    const model = editor?.getModel();

    if (!editor || !provider || !model) return;

    console.log("Initializing MonacoBinding");
    const monacoBinding = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      provider.awareness,
    );

    return () => {
      console.log("Cleaning up MonacoBinding");
      monacoBinding.destroy();
    };
  }, [editor, ytext]);

  const handleMount: OnMount = (editor) => {
    console.log("Editor mounted successfully");
    setEditor(editor);
  };

  return (
    <main className="h-screen w-full bg-neutral-900 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg"></aside>
      <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <div className="h-full w-full">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// start writing code here"
            theme="vs-dark"
            onMount={handleMount}
          />
        </div>
      </section>
    </main>
  );
}

export default App;

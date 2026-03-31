import { Editor } from "@monaco-editor/react";

function App() {
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
          />
        </div>
      </section>
    </main>
  );
}

export default App;

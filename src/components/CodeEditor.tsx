
import { useState, useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme: "vs-dark" | "vs-light";
}

const CodeEditor = ({ language, value, onChange, theme }: CodeEditorProps) => {
  const { toast } = useToast();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const copyToClipboard = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      try {
        await navigator.clipboard.writeText(code);
        toast({
          title: "Copied to clipboard",
          description: `${language.toUpperCase()} code copied successfully`,
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Failed to copy code to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="editor-container relative h-full w-full border border-border rounded-md overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <Button size="sm" variant="outline" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </div>
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={theme}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          folding: true,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
};

export default CodeEditor;

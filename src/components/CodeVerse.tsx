import { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import Preview from "./Preview";
import DeviceSizeSelector from "./DeviceSizeSelector";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, RotateCcw, Copy } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { compressToBase64, decompressFromBase64 } from "lz-string";

const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <main class="container">
        <div class="card">
            <h1>Welcome!</h1>
            <p>Welcome to CodeVerse.</p>
            <button id="actionButton" class="btn-primary">Click Me</button>
        </div>
    </main>
    <footer>
        <p>Created with ❤️ by <a href="https://mohamed.codemz.com/" target="_blank" rel="noopener noreferrer">Mohamed Hamed</a></p>
    </footer>
</body>
</html>`;

const defaultCSS = `:root {
    --bg-color: #111827;
    --card-bg: #1f2937;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --accent-color: #3b82f6;
    --accent-hover: #2563eb;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
}

.card {
    background-color: var(--card-bg);
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 90%;
    width: 500px;
    text-align: center;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, var(--text-primary), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.btn-primary {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background-color: var(--accent-hover);
    transform: scale(1.05);
}

.btn-primary:active {
    transform: scale(0.95);
}

footer {
    text-align: center;
    padding: 1.5rem;
    color: var(--text-secondary);
}

footer a {
    color: var(--accent-color);
    text-decoration: none;
    transition: color 0.3s ease;
}

footer a:hover {
    color: var(--accent-hover);
}

@media (max-width: 480px) {
    .card {
        padding: 1.5rem;
    }

    h1 {
        font-size: 2rem;
    }
}`;

const defaultJS = `document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('actionButton');
  let clickCount = 0;

  button.addEventListener('click', () => {
      clickCount++;
      button.textContent = "Clicked " + clickCount + (clickCount === 1 ? " time" : " times");

      // Add a quick pulse animation
      button.style.animation = 'none';
      button.offsetHeight; // Trigger reflow
      button.style.animation = 'pulse 0.3s ease';
  });
});

// Add keyframe animation for the pulse effect
const style = document.createElement('style');
style.textContent = \`
  @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
  }
\`;
document.head.appendChild(style);`;

// Enhanced functions for fully client-side operation
const generateShareableLink = (html: string, css: string, js: string) => {
  const data = JSON.stringify({ html, css, js });
  const compressed = compressToBase64(data);
  
  // Create a base URL without query parameters
  const url = new URL(window.location.href);
  url.search = ""; // Remove any existing query parameters
  
  // Add our code parameter
  url.searchParams.set("code", compressed);
  return url.toString();
};

const loadFromShareableLink = () => {
  const url = new URL(window.location.href);
  const compressed = url.searchParams.get("code");
  
  if (compressed) {
    try {
      const data = JSON.parse(decompressFromBase64(compressed) || "");
      return { 
        html: data.html || defaultHTML, 
        css: data.css || defaultCSS, 
        js: data.js || defaultJS 
      };
    } catch (e) {
      console.error("Failed to parse shared code", e);
    }
  }
  
  return null;
};

const CodeVerse = () => {
  const [html, setHtml] = useState(defaultHTML);
  const [css, setCss] = useState(defaultCSS);
  const [js, setJs] = useState(defaultJS);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "vs-light">("vs-dark");
  const [deviceSize, setDeviceSize] = useState({ width: "100%", height: "100%" });
  const [manualRefresh, setManualRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("html");
  const [refreshCount, setRefreshCount] = useState(0);
  const { toast } = useToast();

  // Handle initial load and check for shared code
  useEffect(() => {
    try {
      // Load from URL if available
      const sharedCode = loadFromShareableLink();
      if (sharedCode) {
        setHtml(sharedCode.html);
        setCss(sharedCode.css);
        setJs(sharedCode.js);
        toast({
          title: "Shared code loaded",
          description: "The project was loaded from a shared link"
        });
      } else {
        // Load from localStorage if available
        const savedHtml = localStorage.getItem("codeverse-html");
        const savedCss = localStorage.getItem("codeverse-css");
        const savedJs = localStorage.getItem("codeverse-js");
        
        if (savedHtml) setHtml(savedHtml);
        if (savedCss) setCss(savedCss);
        if (savedJs) setJs(savedJs);
      }
    } catch (e) {
      console.error("Error during initialization:", e);
      // Continue with defaults if there's an error
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("codeverse-html", html);
      localStorage.setItem("codeverse-css", css);
      localStorage.setItem("codeverse-js", js);
    } catch (e) {
      console.error("Error saving to localStorage:", e);
      // Just log the error but don't interrupt the user experience
    }
  }, [html, css, js]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const handleReset = () => {
   
      setHtml(defaultHTML);
      setCss(defaultCSS);
      setJs(defaultJS);
    
    
    toast({
      title: "Reset successful",
      description: `ُThe editor has been reset to default`,
    });
  };

  // Enhanced download function with error handling
  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      zip.file("index.html", html);
      zip.file("styles.css", css);
      zip.file("script.js", js);
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "codeverse-project.zip");
      
      toast({
        title: "Download successful",
        description: "Your project has been downloaded as a ZIP file"
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Download failed",
        description: "There was an error creating the ZIP file",
        variant: "destructive"
      });
    }
  };

  // Enhanced share function with error handling
  const handleShare = async () => {
    try {
      const shareableLink = generateShareableLink(html, css, js);
      
      await navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link copied to clipboard",
        description: "Share this link with others to show them your code"
      });
    } catch (err) {
      console.error("Share error:", err);
      toast({
        title: "Copy failed",
        description: "Failed to copy shareable link to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleThemeChange = (theme: "dark" | "light") => {
    setEditorTheme(theme === "dark" ? "vs-dark" : "vs-light");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary mr-4">
            CodeVerse
          </h1>
          <p className="text-muted-foreground hidden md:block">
            Web Code Editor & Live Preview
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle onChange={handleThemeChange} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className="hidden sm:flex items-center"
          >
            <Copy className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="hidden sm:flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b gap-2">
        <div className="flex items-center">
          <div className="flex items-center space-x-2 mr-4">
            <Switch
              id="manual-refresh"
              checked={manualRefresh}
              onCheckedChange={setManualRefresh}
            />
            <Label htmlFor="manual-refresh">Manual Refresh</Label>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <DeviceSizeSelector onChange={setDeviceSize} />
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="editor-tabs">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="flex-1 p-1">
              <CodeEditor 
                language="html" 
                value={html} 
                onChange={setHtml} 
                theme={editorTheme} 
              />
            </TabsContent>
            <TabsContent value="css" className="flex-1 p-1">
              <CodeEditor 
                language="css" 
                value={css} 
                onChange={setCss} 
                theme={editorTheme} 
              />
            </TabsContent>
            <TabsContent value="js" className="flex-1 p-1">
              <CodeEditor 
                language="javascript" 
                value={js} 
                onChange={setJs} 
                theme={editorTheme} 
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Resizer */}
        <div className="resizer hidden md:block w-[6px] cursor-col-resize hover:bg-primary/50"></div>

        {/* Preview panel */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden p-1">
          <Preview 
            html={html} 
            css={css} 
            js={js} 
            deviceSize={deviceSize}
            manualRefresh={manualRefresh}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-2 px-4 text-center text-sm text-muted-foreground">
        <p>
          CodeVerse - Built with
          <a 
            href="https://react.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline mx-1"
          >
            React
          </a>
          and
          <a 
            href="https://microsoft.github.io/monaco-editor/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline mx-1"
          >
            Monaco Editor
          </a>
          By           <a 
            href="https://mohamed.codemz.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline mx-1"
          >
            Mohamed Hamed
          </a>
        </p>
      </footer>
    </div>
  );
};

export default CodeVerse;

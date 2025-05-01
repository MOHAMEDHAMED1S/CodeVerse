
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface PreviewProps {
  html: string;
  css: string;
  js: string;
  deviceSize: { width: string; height: string };
  manualRefresh: boolean;
  onRefresh: () => void;
}

const Preview = ({ html, css, js, deviceSize, manualRefresh, onRefresh }: PreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [lastRendered, setLastRendered] = useState({ html, css, js });

  useEffect(() => {
    if (!manualRefresh) {
      updatePreview();
    }
  }, [html, css, js, manualRefresh]);

  useEffect(() => {
    updateIframeSize();
  }, [deviceSize]);

  const updatePreview = () => {
    if (!iframeRef.current) return;

    setLastRendered({ html, css, js });
    
    const iframeDocument = iframeRef.current.contentDocument || 
                          (iframeRef.current.contentWindow?.document);
    
    if (iframeDocument) {
      iframeDocument.open();
      iframeDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>${js}</script>
          </body>
        </html>
      `);
      iframeDocument.close();
    }

    onRefresh();
  };

  const updateIframeSize = () => {
    if (iframeRef.current) {
      const width = deviceSize.width || "100%";
      const height = deviceSize.height || "100%";
      
      iframeRef.current.style.width = width;
      iframeRef.current.style.height = height;
    }
  };

  const handleRefreshClick = () => {
    updatePreview();
  };

  return (
    <div className="preview-wrapper flex flex-col h-full">
      <div className="preview-header flex items-center justify-between p-2 border-b">
        <div className="text-sm font-medium">Preview</div>
        {manualRefresh && (
          <Button size="sm" onClick={handleRefreshClick}>
            Refresh
          </Button>
        )}
      </div>
      <div className="preview-container flex-1 flex items-center justify-center overflow-auto p-4">
        <iframe 
          ref={iframeRef}
          title="Code Preview"
          className="border-none bg-white shadow-md rounded-md transition-all duration-200"
          style={{
            width: deviceSize.width || "100%",
            height: deviceSize.height || "100%",
            maxWidth: "100%",
            maxHeight: "100%"
          }}
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>
  );
};

export default Preview;

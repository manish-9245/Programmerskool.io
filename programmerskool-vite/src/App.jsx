import { useRef, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Play, Youtube, GripVertical, GripHorizontal, Move, Maximize2 } from 'lucide-react';
import './App.css';

function App() {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistId, setPlaylistId] = useState('PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA');
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`);
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  
  // Video position and size states
  const [videoPosition, setVideoPosition] = useState({ x: 50, y: 100 });
  const [videoSize, setVideoSize] = useState({ width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Code editor height state (for vertical split between code and output)
  const [codeHeight, setCodeHeight] = useState(60); // Percentage for code editor
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Video dragging handlers
  const handleVideoMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return; // Don't drag when resizing
    if (e.target.tagName === 'IFRAME') return; // Don't drag from iframe
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate offset relative to the current video position
    setDragOffset({
      x: e.clientX - videoPosition.x,
      y: e.clientY - videoPosition.y
    });
    
    setIsDragging(true);
    document.body.classList.add('dragging');
  };

  const handleVideoMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate new position using the drag offset
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Get viewport dimensions for boundary checking
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Keep video within viewport bounds (allow some negative Y for going above search bar)
    const maxX = Math.max(0, viewportWidth - videoSize.width);
    const maxY = Math.max(0, viewportHeight - videoSize.height);
    
    setVideoPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(-150, Math.min(newY, maxY)) // Allow -150px to go above search bar
    });
  };

  const handleVideoMouseUp = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    document.body.classList.remove('dragging');
  };

  // Video resizing handlers
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    document.body.classList.add('resizing');
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate new size based on mouse position relative to video position
    const newWidth = Math.max(200, Math.min(800, e.clientX - videoPosition.x));
    const newHeight = Math.max(150, Math.min(600, e.clientY - videoPosition.y));
    
    setVideoSize({
      width: newWidth,
      height: newHeight
    });
  };

  const handleResizeMouseUp = (e) => {
    if (!isResizing) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(false);
    document.body.classList.remove('resizing');
  };

  // Horizontal divider (between Code Editor and Output)
  const handleHorizontalMouseDown = (e) => {
    e.preventDefault();
    setIsHorizontalDragging(true);
    document.body.classList.add('dragging');
  };

  const handleHorizontalTouchStart = (e) => {
    e.preventDefault();
    setIsHorizontalDragging(true);
    document.body.classList.add('dragging');
  };

  const handleHorizontalMouseMove = (e) => {
    if (!isHorizontalDragging || !rightPanelRef.current) return;
    
    // Additional safety check
    if (e.buttons === 0) {
      handleHorizontalMouseUp();
      return;
    }
    
    requestAnimationFrame(() => {
      if (!isHorizontalDragging || !rightPanelRef.current) return;
      
      const panelRect = rightPanelRef.current.getBoundingClientRect();
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      
      if (clientY === undefined) return;
      
      const newCodeHeight = ((clientY - panelRect.top) / panelRect.height) * 100;
      
      // Constrain between 25% and 85%
      const constrainedHeight = Math.max(25, Math.min(85, newCodeHeight));
      setCodeHeight(constrainedHeight);
    });
  };

  const handleHorizontalMouseUp = () => {
    setIsHorizontalDragging(false);
    document.body.classList.remove('dragging');
  };

  // Event listeners for video dragging and resizing
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        handleVideoMouseMove(e);
      } else if (isResizing) {
        handleResizeMouseMove(e);
      }
    };

    const handleMouseUp = (e) => {
      if (isDragging) {
        handleVideoMouseUp(e);
      } else if (isResizing) {
        handleResizeMouseUp(e);
      }
    };

    // Prevent context menu and text selection during dragging
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    // Add event listeners with capture to ensure they fire first
    document.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: false, capture: true });
    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    document.addEventListener('selectstart', handleSelectStart, { passive: false });
    
    // Set appropriate cursor and disable selection globally
    if (isDragging) {
      document.body.style.cursor = 'move';
    } else if (isResizing) {
      document.body.style.cursor = 'nw-resize';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, dragOffset, videoPosition, videoSize]);

  // Event listeners for horizontal dragging
  useEffect(() => {
    if (!isHorizontalDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      handleHorizontalMouseMove(e);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      handleHorizontalMouseMove(e);
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      handleHorizontalMouseUp();
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      handleHorizontalMouseUp();
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isHorizontalDragging]);

  // Extract playlist ID from URL
  function extractPlaylistId(url) {
    const regex = /[?&]list=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  // Handle playlist form submit
  function handleSubmit(e) {
    e.preventDefault();
    const id = extractPlaylistId(playlistUrl);
    if (id) setPlaylistId(id);
    setPlaylistUrl('');
  }

  // Compile code using Wandbox API
  async function compileCode() {
    if (!code.trim()) {
      setOutput('Error: Please enter some code to compile.');
      return;
    }
    
    setIsCompiling(true);
    setOutput('🔄 Compiling your code...');
    
    try {
      const res = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          compiler: 'gcc-head',
          stdin: '',
          options: '-O2 -Wall -std=c++17 -pedantic-errors',
        }),
      });
      const data = await res.json();
      const result = data.program_message || data.compiler_message || data.compiler_output || 'No output generated.';
      setOutput(result);
    } catch (err) {
      setOutput('❌ Network Error: ' + err.message);
    } finally {
      setIsCompiling(false);
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex flex-col" ref={containerRef}>
        {/* Top Input Section */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm relative flex-shrink-0" style={{ zIndex: 100 }}>
          <div className="py-6 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  C<span className="text-blue-600">++</span> Programming Practice
                </h1>
                <p className="text-slate-600 text-base md:text-lg font-normal max-w-xl mx-auto">
                  Learn, code, and compile C++ while watching tutorials
                </p>
              </div>
              
              {/* YouTube Playlist Input Form - Centered */}
              <div className="max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-200/60">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={playlistUrl}
                      onChange={e => setPlaylistUrl(e.target.value)}
                      placeholder="Paste YouTube Playlist URL here..."
                      className="border-0 bg-transparent text-sm placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 h-9"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm h-9 flex-shrink-0"
                  >
                    <Youtube className="w-4 h-4 mr-1.5" />
                    Update
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Draggable and Resizable Video Component */}
          <div
            ref={videoRef}
            className="bg-white rounded-2xl shadow-xl border border-gray-200/50 video-component overflow-hidden"
            style={{
              left: `${videoPosition.x}px`,
              top: `${videoPosition.y}px`,
              width: `${videoSize.width}px`,
              height: `${videoSize.height}px`,
              cursor: isDragging ? 'move' : 'default',
              zIndex: 1000, // High z-index to stay above everything
              userSelect: 'none',
              position: 'fixed' // Use fixed positioning to stay above all content
            }}
          >
            {/* Video Header with Drag Handle */}
            <div 
              className="bg-slate-800 text-white px-3 py-2.5 flex items-center justify-between cursor-move hover:bg-slate-700 transition-colors"
              onMouseDown={handleVideoMouseDown}
            >
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 opacity-80" />
                <span className="text-sm font-medium">YouTube Tutorial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Video iframe */}
            <div className="relative bg-black" style={{ height: 'calc(100% - 40px)' }}>
              <iframe
                width="100%"
                height="100%"
                title="YouTube video player"
                src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="absolute inset-0 pointer-events-auto"
                frameBorder="0"
              />
            </div>
            
            {/* Resize Handle */}
            <div
              className="absolute bottom-0 right-0 w-5 h-5 bg-slate-600 cursor-nw-resize resize-handle hover:bg-slate-700 transition-colors"
              style={{
                background: 'linear-gradient(-45deg, transparent 30%, #475569 30%, #475569 50%, transparent 50%)',
                borderRadius: '0 0 12px 0',
                opacity: 0.8
              }}
              onMouseDown={handleResizeMouseDown}
            >
            </div>
          </div>

          {/* Code Editor and Output - Full Screen */}
          <div className="h-full flex flex-col bg-gray-50/50" ref={rightPanelRef}>
            {/* Code Editor Section */}
            <div 
              className={`flex flex-col min-h-0 ${!isHorizontalDragging ? 'transition-all duration-200' : ''}`}
              style={{ height: `${codeHeight}%` }}
            >
              <div className="p-6 flex-1 flex flex-col min-h-0">
                <Card className="flex-1 shadow-lg border border-gray-200/50 bg-white">
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          C++ Code Editor
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm mt-1">
                          Write and compile your C++ code in real-time
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={compileCode}
                        disabled={isCompiling}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 h-9"
                      >
                        <Play className="w-4 h-4" />
                        {isCompiling ? 'Compiling...' : 'Run Code'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <CodeMirror
                        value={code}
                        height="100%"
                        maxHeight={`${Math.max(200, (codeHeight * window.innerHeight) / 100 - 200)}px`}
                        className="h-full w-full text-base"
                        extensions={[cpp()]}
                        onChange={setCode}
                        theme="light"
                        placeholder="Enter your C++ code here..."
                        basicSetup={{
                          lineNumbers: true,
                          foldGutter: true,
                          dropCursor: false,
                          allowMultipleSelections: false,
                          indentOnInput: true,
                          bracketMatching: true,
                          closeBrackets: true,
                          autocompletion: true,
                          highlightSelectionMatches: true,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div 
              className={`draggable-divider horizontal-divider ${isHorizontalDragging ? 'dragging' : ''} bg-gray-200 hover:bg-slate-300 transition-colors`}
              onMouseDown={handleHorizontalMouseDown}
              onTouchStart={handleHorizontalTouchStart}
            >
              <GripHorizontal className="w-4 h-4 text-slate-500" />
            </div>

            {/* Output Section */}
            <div 
              className={`flex flex-col ${!isHorizontalDragging ? 'transition-all duration-200' : ''}`}
              style={{ height: `${100 - codeHeight}%` }}
            >
              <div className="p-6 flex-1 flex flex-col min-h-0">
                <Card className="flex-1 shadow-lg border border-gray-200/50 bg-white flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Output Console
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-sm mt-1">
                      Compilation results and program output
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0 p-6">
                    <div className="bg-slate-900 text-green-400 p-6 rounded-xl font-mono text-sm flex-1 shadow-lg border border-slate-700 overflow-auto relative">
                      {/* Terminal-style header */}
                      <div className="mt-8 pt-2">
                        <pre className="whitespace-pre-wrap leading-relaxed">
                          {output || '💡 Welcome! Click "Run Code" to compile and execute your C++ program.\n\n$ _'}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-sm flex-shrink-0">
          <div className="py-4 px-6 text-center">
            <p className="text-slate-500 text-sm font-light">
              Made with ❤️ by{' '}
              <a 
                href="https://github.com/manish-9245" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 underline decoration-dotted underline-offset-2"
              >
                Manish Tiwari
              </a>
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;

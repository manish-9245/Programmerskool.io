import { useRef, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Play, Youtube, GripVertical, GripHorizontal } from 'lucide-react';
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
  
  // Split states
  const [leftWidth, setLeftWidth] = useState(50); // Percentage for left panel (YouTube)
  const [codeHeight, setCodeHeight] = useState(60); // Percentage for code editor in right panel
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Vertical divider (between YouTube and Code/Output)
  const handleVerticalMouseDown = (e) => {
    e.preventDefault();
    setIsVerticalDragging(true);
    document.body.classList.add('dragging');
  };

  const handleVerticalTouchStart = (e) => {
    e.preventDefault();
    setIsVerticalDragging(true);
    document.body.classList.add('dragging');
  };

  const handleVerticalMouseMove = (e) => {
    if (!isVerticalDragging || !containerRef.current) return;
    
    // Additional safety check
    if (e.buttons === 0) {
      handleVerticalMouseUp();
      return;
    }
    
    requestAnimationFrame(() => {
      if (!isVerticalDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      
      if (clientX === undefined) return;
      
      const newLeftWidth = ((clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 20% and 80%
      const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
      setLeftWidth(constrainedWidth);
    });
  };

  const handleVerticalMouseUp = () => {
    setIsVerticalDragging(false);
    document.body.classList.remove('dragging');
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

  // Event listeners for dragging with proper cleanup
  useEffect(() => {
    if (!isVerticalDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      handleVerticalMouseMove(e);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      handleVerticalMouseMove(e);
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      handleVerticalMouseUp();
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      handleVerticalMouseUp();
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Set cursor and disable selection
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // Only reset cursor if no other dragging is active
      if (!isHorizontalDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isVerticalDragging, isHorizontalDragging]);

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

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Set cursor and disable selection
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // Only reset cursor if no other dragging is active
      if (!isVerticalDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isHorizontalDragging, isVerticalDragging]);

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
      <div className="min-h-screen w-screen ml-[-29%] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
        {/* Header - Hidden in fullscreen mode */}
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-lg relative flex-shrink-0">
          <div className="py-6 px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                C++ Programming Practice
              </span>
            </h1>
            <h1 className="text-center text-slate-600 text-base md:text-lg font-medium">
              Learn, code, and compile C++ while watching tutorials
            </h1>
          </div>
        </div>

        {/* Main Content - centered, fills screen in fullscreen */}
        <div className={`flex-1 flex justify-center py-4 px-4`}> 
          <div className={`w-full 'max-w-[80vw]' main-content-container flex flex-col`}> 

            {/* Main Content Container */}
            <div 
              className={`flex-1 flex overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200 ${isMobile ? 'mobile-stack' : ''}`} 
              ref={containerRef}
            >
              {/* Left Panel - YouTube */}
              <div 
                className={`content-panel bg-white/70 backdrop-blur-sm overflow-hidden ${!isVerticalDragging ? 'resizable-panel' : 'no-transition'} ${isMobile ? 'mobile-panel' : ''}`}
                style={{ 
                  width: isMobile ? '100%' : `${leftWidth}%`,
                  height: isMobile ? '50%' : '100%'
                }}
              >
                <div className="p-6 h-full flex flex-col sm:p-4">
                  {/* YouTube Playlist Input Form */}
                  <div className="mb-6">
                    <form onSubmit={handleSubmit} className="flex items-center gap-4 sm:flex-col sm:gap-2">
                      <div className="flex-1 sm:w-full">
                        <input
                          type="text"
                          value={playlistUrl}
                          onChange={e => setPlaylistUrl(e.target.value)}
                          placeholder="Paste YouTube Playlist URL here..."
                          className="w-full border border-slate-300 rounded-lg px-4 py-4 mb-6 sm:py-3 sm:mb-4"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg mb-6 ml-6 sm:ml-0 sm:w-full"
                      >
                        Update Playlist
                      </button>
                    </form>
                  </div>
                  
                  {/* Video Container */}
                  <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl min-h-0">
                    <iframe
                      width="100%"
                      height="100%"
                      title="YouTube video player"
                      src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

          {/* Vertical Divider - Hidden on mobile */}
          {!isMobile && (
            <div 
              className={`draggable-divider vertical-divider ${isVerticalDragging ? 'dragging' : ''}`}
              onMouseDown={handleVerticalMouseDown}
              onTouchStart={handleVerticalTouchStart}
            >
              <GripVertical className="w-3 h-3 text-slate-500" />
            </div>
          )}

          {/* Right Panel - Code Editor and Output */}
          <div 
            className={`bg-white/70 backdrop-blur-sm overflow-hidden flex flex-col ${!isVerticalDragging ? 'resizable-panel' : 'no-transition'}`}
            style={{ 
              width: isMobile ? '100%' : `${100 - leftWidth}%`,
              height: isMobile ? '50%' : '100%'
            }}
            ref={rightPanelRef}
          >
            {/* Code Editor Section */}
            <div 
              className={`p-6 flex flex-col min-h-0 ${!isHorizontalDragging ? 'resizable-panel' : 'no-transition'}`}
              style={{ height: `${codeHeight}%` }}
            >
                <Card className="flex-1 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">C++ Code Editor</CardTitle>
                      <CardDescription className="text-slate-600">
                        Write and compile your C++ code in real-time
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={compileCode}
                      disabled={isCompiling}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white gap-2 shadow-md hover:shadow-lg transition duration-200 ease-in-out px-6 py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      size="lg"
                    >
                      <Play className="w-4 h-4" />
                      {isCompiling ? 'Compiling...' : 'Run Code'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden min-h-0 ">
                  <div className="flex-1 border border-slate-200 rounded-lg bg-white shadow-inner min-h-0 overflow-hidden">
                    <div className="h-full flex-1 min-h-0 overflow-auto">
                      <CodeMirror
                        value={code}
                        height="100%"
                        className="h-full w-full"
                        extensions={[cpp()]}
                        onChange={setCode}
                        theme="light"
                        maxHeight={`${codeHeight-19}vh`}
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
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Horizontal Divider */}
            <div 
              className={`draggable-divider horizontal-divider ${isHorizontalDragging ? 'dragging' : ''}`}
              onMouseDown={handleHorizontalMouseDown}
              onTouchStart={handleHorizontalTouchStart}
            >
              <GripHorizontal className="w-3 h-3 text-slate-500" />
            </div>

            {/* Output Section */}
            <div 
              className={`p-6 flex flex-col ${!isHorizontalDragging ? 'resizable-panel' : 'no-transition'}`}
              style={{ height: `${100 - codeHeight}%` }}
            >
              <Card className="flex-1 shadow-lg border-0 bg-white/80 backdrop-blur-sm flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <CardTitle className="text-xl">Output</CardTitle>
                  <CardDescription className="text-slate-600">
                    Compilation results and program output
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm flex-1 shadow-inner border border-slate-700 output-container">
                    <pre className="whitespace-pre-wrap text-left">
                      {output || '💡 Welcome! Click "Run Code" to compile and execute your C++ program.'}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>

        {/* Footer - Hidden in fullscreen mode */}
        <footer className="bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-lg mt-auto flex-shrink-0">
          <div className="py-4 px-4 text-center">
            <p className="text-slate-600 text-sm">
              Made with ❤️ by{' '}
              <a 
                href="https://github.com/manish-9245" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
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

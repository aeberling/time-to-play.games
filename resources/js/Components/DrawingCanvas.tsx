import { useRef, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

/**
 * DrawingCanvas Component - Mobile-Optimized Edition
 *
 * Professional drawing canvas using react-sketch-canvas library with:
 * - Excellent touch support for phones and tablets
 * - Undo/redo functionality
 * - Eraser tool
 * - SVG-based rendering for smooth lines
 * - Color picker and brush size controls
 * - Responsive design
 */

interface DrawingCanvasProps {
    onComplete: (imageData: string) => void;
    width?: number;
    height?: number;
    disabled?: boolean;
}

export default function DrawingCanvas({
    onComplete,
    width = 600,
    height = 400,
    disabled = false
}: DrawingCanvasProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(4);
    const [isEraserMode, setIsEraserMode] = useState(false);

    // Handle undo
    const handleUndo = () => {
        if (!disabled && canvasRef.current) {
            canvasRef.current.undo();
        }
    };

    // Handle redo
    const handleRedo = () => {
        if (!disabled && canvasRef.current) {
            canvasRef.current.redo();
        }
    };

    // Toggle eraser mode
    const toggleEraser = () => {
        if (!disabled && canvasRef.current) {
            const newEraserMode = !isEraserMode;
            setIsEraserMode(newEraserMode);
            canvasRef.current.eraseMode(newEraserMode);
        }
    };

    // Clear canvas
    const clearCanvas = () => {
        if (!disabled && canvasRef.current) {
            canvasRef.current.clearCanvas();
        }
    };

    // Submit drawing
    const submitDrawing = async () => {
        if (!canvasRef.current || disabled) return;

        try {
            // Export as PNG base64
            const imageData = await canvasRef.current.exportImage('png');
            onComplete(imageData);
        } catch (error) {
            console.error('Error exporting drawing:', error);
        }
    };

    return (
        <div className="drawing-canvas-container w-full max-w-3xl mx-auto">
            {/* Drawing Tools */}
            <div className="canvas-tools mb-4 flex flex-wrap gap-3 items-center justify-center sm:justify-start bg-white p-4 rounded-lg shadow-md">
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Color:</label>
                    <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => {
                            setCurrentColor(e.target.value);
                            if (isEraserMode && canvasRef.current) {
                                // Exit eraser mode when changing color
                                setIsEraserMode(false);
                                canvasRef.current.eraseMode(false);
                            }
                        }}
                        disabled={disabled}
                        className="w-12 h-10 cursor-pointer border-2 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Brush:</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        disabled={disabled}
                        className="w-24 sm:w-32 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-600 w-8 text-center">{lineWidth}px</span>
                </div>

                {/* Tool Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={toggleEraser}
                        disabled={disabled}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            isEraserMode
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    >
                        {isEraserMode ? '✏️ Draw' : '🧹 Eraser'}
                    </button>

                    <button
                        onClick={handleUndo}
                        disabled={disabled}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                        ↶ Undo
                    </button>

                    <button
                        onClick={handleRedo}
                        disabled={disabled}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                        ↷ Redo
                    </button>

                    <button
                        onClick={clearCanvas}
                        disabled={disabled}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="canvas-wrapper mb-4 flex justify-center">
                <div className="relative inline-block">
                    <ReactSketchCanvas
                        ref={canvasRef}
                        width={`${width}px`}
                        height={`${height}px`}
                        strokeWidth={lineWidth}
                        strokeColor={currentColor}
                        canvasColor="white"
                        className={`
                            border-4 border-gray-400 rounded-lg shadow-xl
                            max-w-full h-auto
                            ${disabled ? 'opacity-50 pointer-events-none' : ''}
                        `}
                        style={{
                            touchAction: 'none', // Prevent scrolling while drawing
                        }}
                        // Additional props for better mobile experience
                        exportWithBackgroundImage={false}
                        allowOnlyPointerType="all" // Accept mouse, touch, and pen
                    />

                    {/* Mobile hint overlay (only shows on small screens initially) */}
                    <div className="sm:hidden absolute top-2 left-2 right-2 bg-blue-100 text-blue-800 text-xs p-2 rounded pointer-events-none opacity-75">
                        💡 Draw with your finger or stylus
                    </div>
                </div>
            </div>

            {/* Instructions for mobile users */}
            <div className="text-center text-sm text-gray-600 mb-4 sm:hidden">
                <p>Use the eraser to fix mistakes or undo/redo your strokes</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
                <button
                    onClick={submitDrawing}
                    disabled={disabled}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg disabled:cursor-not-allowed active:scale-95 transform"
                >
                    Submit Drawing
                </button>
            </div>

            {/* Desktop-only additional tips */}
            <div className="hidden sm:block text-center text-sm text-gray-500 mt-4">
                <p>
                    <strong>Tips:</strong> Use the color picker for different colors •
                    Adjust brush size for thick or thin lines •
                    Use eraser for corrections
                </p>
            </div>
        </div>
    );
}

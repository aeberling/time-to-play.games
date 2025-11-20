import { useEffect, useRef, useState } from 'react';

/**
 * DrawingCanvas Component
 *
 * A fully-featured HTML5 canvas drawing component with:
 * - Mouse and touch input support
 * - Color picker and brush size controls
 * - Clear and submit functionality
 * - Mobile-friendly interface
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas background to white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Set drawing properties
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        setContext(ctx);
    }, [width, height]);

    // Get coordinates from event (works for both mouse and touch)
    const getCoordinates = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in e) {
            // Touch event
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };
        } else {
            // Mouse event
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }
    };

    // Start drawing
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!context || disabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Prevent scrolling on touch devices
        if ('touches' in e) {
            e.preventDefault();
        }

        const coords = getCoordinates(e.nativeEvent, canvas);
        setIsDrawing(true);

        context.beginPath();
        context.moveTo(coords.x, coords.y);
    };

    // Draw
    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !context || disabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Prevent scrolling on touch devices
        if ('touches' in e) {
            e.preventDefault();
        }

        const coords = getCoordinates(e.nativeEvent, canvas);

        context.strokeStyle = currentColor;
        context.lineWidth = lineWidth;
        context.lineTo(coords.x, coords.y);
        context.stroke();
    };

    // Stop drawing
    const stopDrawing = () => {
        if (!context) return;
        context.closePath();
        setIsDrawing(false);
    };

    // Clear canvas
    const clearCanvas = () => {
        if (!context || disabled) return;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
    };

    // Submit drawing
    const submitDrawing = () => {
        if (!canvasRef.current || disabled) return;

        // Convert canvas to base64 PNG
        const imageData = canvasRef.current.toDataURL('image/png');
        onComplete(imageData);
    };

    return (
        <div className="drawing-canvas-container w-full max-w-3xl mx-auto">
            {/* Drawing Tools */}
            <div className="canvas-tools mb-4 flex flex-wrap gap-4 items-center justify-center sm:justify-start">
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Color:</label>
                    <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => setCurrentColor(e.target.value)}
                        disabled={disabled}
                        className="w-12 h-10 cursor-pointer border border-gray-300 rounded disabled:opacity-50"
                    />
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Brush Size:</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        disabled={disabled}
                        className="w-32 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-600 w-6">{lineWidth}</span>
                </div>

                {/* Clear Button */}
                <button
                    onClick={clearCanvas}
                    disabled={disabled}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Canvas */}
            <div className="canvas-wrapper mb-4 flex justify-center">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className={`
                        border-2 border-gray-400 rounded-lg bg-white shadow-lg
                        max-w-full h-auto
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'}
                    `}
                    style={{
                        touchAction: 'none', // Prevent default touch behaviors
                    }}
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
                <button
                    onClick={submitDrawing}
                    disabled={disabled}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg"
                >
                    Submit Drawing
                </button>
            </div>
        </div>
    );
}

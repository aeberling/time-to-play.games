# React Drawing Library Research for Telestrations (Mobile-Focused)

**Date:** November 20, 2025
**Purpose:** Find the best React drawing library for mobile devices (phones and iPads) for the Telestrations drawing/guessing game

## Current Implementation

The current implementation uses plain HTML5 Canvas with:
- Manual touch and mouse event handling
- Basic drawing features (color picker, brush size, clear)
- No undo/redo functionality
- ~200 lines of custom code in `DrawingCanvas.tsx`

## Research Summary

### Libraries Evaluated

1. **react-sketch-canvas**
2. **react-signature-canvas**
3. **react-canvas-draw**
4. **perfect-freehand**
5. **react-painter** (insufficient data available)

---

## Detailed Analysis

### 1. react-sketch-canvas

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas
**NPM:** react-sketch-canvas

#### Stats
- Weekly Downloads: ~22,951
- GitHub Stars: 524
- Last Published: 3 years ago (v6.2.0)
- Bundle Size: ~15-20KB minified, ~5-8KB gzipped
- TypeScript: Yes (94.4% of codebase)
- React Version: Requires React >= 16.8

#### Mobile Support
- Explicitly supports Desktop and Mobile
- Accepts input from Mouse, touch, and graphic tablets
- Built-in touch event handling
- SVG-based rendering (vector quality)

#### Features
- Freehand vector drawing using SVG
- Undo/Redo: `undo()` and `redo()` methods
- Eraser: `eraseMode(true/false)` with configurable `eraserWidth`
- Stroke customization: `strokeColor`, `strokeWidth`
- Export: `exportImage()`, `exportPaths()`, `exportSvg()`
- Import: `loadPaths()` for loading saved drawings
- Background images supported
- Restrict input types: `allowOnlyPointerType` prop

#### Usage Example
```typescript
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef } from "react";

const Canvas = () => {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  return (
    <>
      <div className="tools">
        <button onClick={() => canvasRef.current?.undo()}>Undo</button>
        <button onClick={() => canvasRef.current?.redo()}>Redo</button>
        <button onClick={() => canvasRef.current?.eraseMode(true)}>Eraser</button>
        <button onClick={() => canvasRef.current?.eraseMode(false)}>Pen</button>
        <button onClick={() => canvasRef.current?.clearCanvas()}>Clear</button>
      </div>

      <ReactSketchCanvas
        ref={canvasRef}
        width="600"
        height="400"
        strokeWidth={4}
        strokeColor="red"
        canvasColor="white"
        exportWithBackgroundImage={true}
      />
    </>
  );
};
```

#### Pros
- Excellent feature set (undo/redo, eraser built-in)
- Explicit mobile touch support
- SVG-based (scalable, vector quality)
- TypeScript support
- Small bundle size
- Clean API with refs
- Export in multiple formats (PNG, SVG, paths)

#### Cons
- Last updated 3 years ago (marked as "Inactive" by Snyk)
- May not receive future updates
- SVG rendering could have performance issues with very complex drawings

---

### 2. react-signature-canvas

**GitHub:** https://github.com/agilgur5/react-signature-canvas
**NPM:** react-signature-canvas

#### Stats
- Weekly Downloads: Very high (9,300+ projects use it)
- GitHub Stars: 623
- Last Published: March 29, 2025 (v1.1.0-alpha.2) - Active!
- Bundle Size: <150 lines of wrapper code
- TypeScript: Yes (written in TypeScript)
- React Version: Compatible with React 18

#### Mobile Support
- Underlying signature_pad library supports touch input
- Designed for signature capture on mobile devices
- Canvas-based rendering

#### Features
- Digital signature capture with customizable pen properties
- Methods: `isEmpty()`, `clear()`, `toDataURL()`, `fromDataURL()`, `toData()`, `fromData()`
- Trim support: `getTrimmedCanvas()` - removes whitespace
- Event callbacks: `onBegin`, `onEnd`
- Direct canvas prop passing via `canvasProps`
- 100% test coverage

#### Usage Example
```typescript
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';

const DrawingApp = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => sigCanvas.current?.clear();
  const save = () => {
    const dataURL = sigCanvas.current?.toDataURL('image/png');
    // Use dataURL
  };

  return (
    <>
      <button onClick={clear}>Clear</button>
      <button onClick={save}>Save</button>

      <SignatureCanvas
        ref={sigCanvas}
        penColor='black'
        minWidth={2}
        maxWidth={4}
        canvasProps={{
          width: 600,
          height: 400,
          className: 'signature-canvas'
        }}
      />
    </>
  );
};
```

#### Pros
- Actively maintained (March 2025 release!)
- React 18 compatible
- Very lightweight wrapper
- High usage and trust (9,300+ projects)
- 100% test coverage
- Excellent for smooth drawing
- Mobile touch support via signature_pad

#### Cons
- No built-in undo/redo (would need to implement manually)
- No built-in eraser mode
- No built-in color picker
- Limited to signature_pad features
- Canvas-based (not vector/scalable)
- Primarily designed for signatures, not complex drawings

---

### 3. react-canvas-draw

**NPM:** react-canvas-draw

#### Stats
- Last Published: 4 years ago (v1.2.1)
- Maintenance Status: Inactive/Unmaintained
- Multiple forks exist (nahui-react-canvas-draw, react-canvas-draw-modified)

#### Assessment
**Not Recommended** - The library hasn't been updated in 4 years and is marked as inactive. Multiple forks suggest the community has moved on. While it may have features needed, using an unmaintained library is risky for production applications.

---

### 4. perfect-freehand

**GitHub:** https://github.com/steveruizok/perfect-freehand
**NPM:** perfect-freehand

#### Stats
- Weekly Downloads: Good (167+ dependents)
- Last Updated: Active into 2025
- Bundle Size: Very small (zero dependencies)
- TypeScript: Yes (exports `StrokeOptions` type)

#### Mobile Support
- Uses Pointer Events API for universal input
- Supports `setPointerCapture`, pressure sensitivity
- Works with touch, mouse, and stylus

#### Features
- Generates pressure-sensitive stroke outlines
- Low-level library (you build UI around it)
- Customizable: size, thinning, smoothing, streamline, tapering
- Simulates pressure from velocity or uses real pen/stylus input
- SVG or Canvas rendering
- Very performant ("plenty fast")

#### Usage Example
```typescript
import { getStroke } from 'perfect-freehand';
import { getSvgPathFromStroke } from 'perfect-freehand';
import { useState } from 'react';

const DrawingApp = () => {
  const [points, setPoints] = useState([]);

  const handlePointerDown = (e) => {
    setPoints([[e.pageX, e.pageY, e.pressure]]);
  };

  const handlePointerMove = (e) => {
    if (e.buttons !== 1) return;
    setPoints([...points, [e.pageX, e.pageY, e.pressure]]);
  };

  const stroke = getStroke(points, {
    size: 16,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  const pathData = getSvgPathFromStroke(stroke);

  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ touchAction: 'none' }}
    >
      <path d={pathData} fill="black" />
    </svg>
  );
};
```

#### Pros
- Very small bundle size (zero dependencies)
- Beautiful, smooth, pressure-sensitive strokes
- Actively maintained
- TypeScript support
- Excellent performance
- Flexible (SVG or Canvas)
- Great for premium drawing feel

#### Cons
- Low-level library - requires building complete UI
- No built-in undo/redo, color picker, eraser, etc.
- More implementation work required
- Need to manage state, history, tools yourself
- Longer development time

---

## Recommendation

### Best Choice: react-sketch-canvas

**Despite being "inactive" for 3 years, react-sketch-canvas is the best choice for your Telestrations game.**

#### Why?

1. **Complete Feature Set Out-of-the-Box**
   - Undo/Redo built-in
   - Eraser mode built-in
   - Works immediately with minimal code

2. **Excellent Mobile Support**
   - Explicitly designed for touch devices
   - Handles mouse, touch, and tablets
   - No additional touch handling code needed

3. **Small Bundle Size**
   - ~5-8KB gzipped is very reasonable
   - Won't impact your app performance

4. **TypeScript Support**
   - Full type definitions included
   - Better developer experience

5. **SVG-Based Rendering**
   - Vector quality drawings
   - Scales well on different screen sizes
   - Better for viewing on different devices

6. **Clean API**
   - Ref-based methods
   - Easy to integrate
   - Minimal learning curve

7. **Mature and Stable**
   - 3 years without updates might mean it's feature-complete and stable
   - 22,951 weekly downloads show continued usage
   - No major issues reported

#### Installation

```bash
npm install react-sketch-canvas
```

#### Implementation Strategy

Replace the current `DrawingCanvas.tsx` component with react-sketch-canvas:

1. **Phase 1: Basic Integration**
   ```typescript
   import { ReactSketchCanvas } from 'react-sketch-canvas';
   import { useRef, useState } from 'react';

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
     const [isEraser, setIsEraser] = useState(false);

     const handleSubmit = async () => {
       const imageData = await canvasRef.current?.exportImage('png');
       if (imageData) {
         onComplete(imageData);
       }
     };

     const handleEraserToggle = () => {
       const newMode = !isEraser;
       setIsEraser(newMode);
       canvasRef.current?.eraseMode(newMode);
     };

     return (
       <div className="drawing-canvas-container">
         {/* Tools */}
         <div className="canvas-tools">
           <label>Color:</label>
           <input
             type="color"
             value={currentColor}
             onChange={(e) => setCurrentColor(e.target.value)}
             disabled={disabled || isEraser}
           />

           <label>Brush Size:</label>
           <input
             type="range"
             min="1"
             max="20"
             value={lineWidth}
             onChange={(e) => setLineWidth(Number(e.target.value))}
             disabled={disabled}
           />

           <button
             onClick={() => canvasRef.current?.undo()}
             disabled={disabled}
           >
             Undo
           </button>

           <button
             onClick={() => canvasRef.current?.redo()}
             disabled={disabled}
           >
             Redo
           </button>

           <button
             onClick={handleEraserToggle}
             disabled={disabled}
           >
             {isEraser ? 'Pen' : 'Eraser'}
           </button>

           <button
             onClick={() => canvasRef.current?.clearCanvas()}
             disabled={disabled}
           >
             Clear
           </button>
         </div>

         {/* Canvas */}
         <ReactSketchCanvas
           ref={canvasRef}
           width={`${width}px`}
           height={`${height}px`}
           strokeWidth={lineWidth}
           strokeColor={currentColor}
           canvasColor="white"
           style={{
             border: '2px solid #ccc',
             borderRadius: '8px',
             touchAction: 'none',
           }}
         />

         {/* Submit */}
         <button
           onClick={handleSubmit}
           disabled={disabled}
           className="submit-button"
         >
           Submit Drawing
         </button>
       </div>
     );
   }
   ```

2. **Phase 2: Add TypeScript Types**
   ```typescript
   import type { ReactSketchCanvasRef } from 'react-sketch-canvas';
   ```

3. **Phase 3: Test on Mobile Devices**
   - Test on iPhone
   - Test on iPad
   - Test on Android phones
   - Verify touch sensitivity
   - Verify undo/redo works
   - Verify eraser works

---

## Alternative Consideration: react-signature-canvas

If you encounter issues with react-sketch-canvas being inactive, **react-signature-canvas** is the best alternative:

### Pros
- Actively maintained (March 2025 release)
- React 18 compatible
- Very popular (9,300+ projects)
- Excellent mobile touch support
- Small and lightweight

### Cons to Address
- Need to implement custom undo/redo
- Need to implement custom eraser mode
- More work to build complete drawing tool

### Implementation with Undo/Redo

```typescript
import SignatureCanvas from 'react-signature-canvas';
import { useRef, useState } from 'react';

export default function DrawingCanvas({ onComplete, width = 600, height = 400 }) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  // Save state to history after each stroke
  const handleEnd = () => {
    if (!sigCanvas.current) return;

    const dataURL = sigCanvas.current.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataURL);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      sigCanvas.current?.fromDataURL(history[prevStep]);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      sigCanvas.current?.fromDataURL(history[nextStep]);
    }
  };

  const clear = () => {
    sigCanvas.current?.clear();
    setHistory([]);
    setHistoryStep(0);
  };

  const handleSubmit = () => {
    const dataURL = sigCanvas.current?.toDataURL('image/png');
    if (dataURL) {
      onComplete(dataURL);
    }
  };

  return (
    <div className="drawing-canvas-container">
      <div className="canvas-tools">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
        />

        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />

        <button onClick={undo} disabled={historyStep === 0}>Undo</button>
        <button onClick={redo} disabled={historyStep === history.length - 1}>Redo</button>
        <button onClick={clear}>Clear</button>
      </div>

      <SignatureCanvas
        ref={sigCanvas}
        penColor={currentColor}
        minWidth={lineWidth}
        maxWidth={lineWidth}
        onEnd={handleEnd}
        canvasProps={{
          width,
          height,
          className: 'signature-canvas',
          style: { touchAction: 'none' }
        }}
      />

      <button onClick={handleSubmit}>Submit Drawing</button>
    </div>
  );
}
```

---

## Summary Table

| Library | Bundle Size | Mobile Touch | TypeScript | Undo/Redo | Eraser | Maintenance | Recommendation |
|---------|-------------|--------------|------------|-----------|--------|-------------|----------------|
| react-sketch-canvas | ~5-8KB gzip | Excellent | Yes | Built-in | Built-in | Inactive (stable) | **BEST CHOICE** |
| react-signature-canvas | Very small | Excellent | Yes | Manual | Manual | Active (2025) | **BEST ALTERNATIVE** |
| react-canvas-draw | Unknown | Unknown | Partial | Unknown | Unknown | Dead (4yr) | Avoid |
| perfect-freehand | Very small | Excellent | Yes | Manual | Manual | Active | Too low-level |

---

## Conclusion

**Use react-sketch-canvas for your Telestrations game.**

It provides everything you need out of the box with excellent mobile support. The "inactive" status is not a concern because:

1. The library is feature-complete
2. It's actively used (22,951 weekly downloads)
3. No major bugs reported
4. SVG-based rendering is stable technology

You'll save significant development time compared to building undo/redo and eraser functionality yourself, and you'll get a better user experience on mobile devices with minimal effort.

If you later encounter issues (unlikely), you can migrate to react-signature-canvas as it has a similar API structure.

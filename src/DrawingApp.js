import React, { useState, useRef } from 'react';
import './DrawingApp.css';

const DrawingApp = () => {
  // State management for shapes and painting name
  const [shapes, setShapes] = useState([]);
  const [paintingName, setPaintingName] = useState('My Painting');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b'); // Default color
  const fileInputRef = useRef(null);

  // Available colors for shapes
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];

  // Handle drag start - create drag image
  const handleDragStart = (e, shapeType) => {
    e.dataTransfer.setData('shapeType', shapeType);
    e.dataTransfer.setData('color', selectedColor);
    
    // Create custom drag image
    const dragElement = document.createElement('div');
    dragElement.className = `shape ${shapeType}`;
    dragElement.style.backgroundColor = selectedColor;
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-1000px';
    dragElement.style.width = '50px';
    dragElement.style.height = '50px';
    
    // Special styling for each shape
    if (shapeType === 'circle') {
      dragElement.style.borderRadius = '50%';
    } else if (shapeType === 'triangle') {
      dragElement.style.backgroundColor = 'transparent';
      dragElement.style.borderLeft = '25px solid transparent';
      dragElement.style.borderRight = '25px solid transparent';
      dragElement.style.borderBottom = `50px solid ${selectedColor}`;
      dragElement.style.width = '0';
      dragElement.style.height = '0';
    } else if (shapeType === 'trapezoid') {
      dragElement.style.backgroundColor = 'transparent';
      dragElement.style.borderLeft = '10px solid transparent';
      dragElement.style.borderRight = '10px solid transparent';
      dragElement.style.borderBottom = `50px solid ${selectedColor}`;
      dragElement.style.width = '30px';
      dragElement.style.height = '0';
    }
    
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 25, 25);
    
    // Clean up drag element after drag starts
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  };

  // Handle drop event on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData('shapeType');
    const color = e.dataTransfer.getData('color');
    
    if (shapeType) {
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - 25; // Center the shape
      const y = e.clientY - canvasRect.top - 25;
      
      // Create new shape object
      const newShape = {
        id: Date.now(),
        type: shapeType,
        x: Math.max(0, Math.min(x, canvasRect.width - 50)),
        y: Math.max(0, Math.min(y, canvasRect.height - 50)),
        color: color
      };
      
      setShapes(prev => [...prev, newShape]);
    }
  };

  // Allow drop on canvas
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove shape on double click
  const handleShapeDoubleClick = (shapeId) => {
    setShapes(prev => prev.filter(shape => shape.id !== shapeId));
  };

  // Render individual shape on canvas
  const renderShape = (shape) => {
    const baseStyle = {
      position: 'absolute',
      left: `${shape.x}px`,
      top: `${shape.y}px`,
      width: '50px',
      height: '50px',
      cursor: 'pointer',
    };

    switch (shape.type) {
      case 'square':
        return (
          <div
            key={shape.id}
            style={{
              ...baseStyle,
              backgroundColor: shape.color,
            }}
            onDoubleClick={() => handleShapeDoubleClick(shape.id)}
          />
        );
      
      case 'circle':
        return (
          <div
            key={shape.id}
            style={{
              ...baseStyle,
              backgroundColor: shape.color,
              borderRadius: '50%',
            }}
            onDoubleClick={() => handleShapeDoubleClick(shape.id)}
          />
        );
      
      case 'triangle':
        return (
          <div
            key={shape.id}
            style={{
              ...baseStyle,
              width: '0',
              height: '0',
              backgroundColor: 'transparent',
              borderLeft: '25px solid transparent',
              borderRight: '25px solid transparent',
              borderBottom: `50px solid ${shape.color}`,
            }}
            onDoubleClick={() => handleShapeDoubleClick(shape.id)}
          />
        );
      
      case 'trapezoid':
        return (
          <div
            key={shape.id}
            style={{
              ...baseStyle,
              width: '30px',
              height: '0',
              backgroundColor: 'transparent',
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: `50px solid ${shape.color}`,
            }}
            onDoubleClick={() => handleShapeDoubleClick(shape.id)}
          />
        );
      
      default:
        return null;
    }
  };

  // Calculate shape counts for footer
  const getShapeCounts = () => {
    const counts = { square: 0, circle: 0, triangle: 0, trapezoid: 0 };
    shapes.forEach(shape => {
      counts[shape.type]++;
    });
    return counts;
  };

  // Export painting as JSON
  const handleExport = () => {
    const paintingData = {
      name: paintingName,
      shapes: shapes
    };
    
    const dataStr = JSON.stringify(paintingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${paintingName.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  // Import painting from JSON file
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection for import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const paintingData = JSON.parse(e.target?.result);
          if (paintingData.name && paintingData.shapes) {
            setPaintingName(paintingData.name);
            setShapes(paintingData.shapes);
          }
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const shapeCounts = getShapeCounts();

  return (
    <div className="drawing-app">
      {/* Header section */}
      <header className="header">
        <input
          type="text"
          value={paintingName}
          onChange={(e) => setPaintingName(e.target.value)}
          className="painting-name"
        />
        <div className="header-buttons">
          <button onClick={handleImport} className="btn import-btn">
            Import
          </button>
          <button onClick={handleExport} className="btn export-btn">
            Export
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
      </header>

      <div className="main-content">
        {/* Sidebar with shapes */}
        <aside className="sidebar">
          <h3>Shapes</h3>
          
          {/* Color selector */}
          <div className="color-selector">
            <h4>Colors</h4>
            <div className="color-options">
              {colors.map(color => (
                <div
                  key={color}
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Shape options */}
          <div className="shape-list">
            <div
              className="shape-item"
              draggable
              onDragStart={(e) => handleDragStart(e, 'square')}
            >
              <div className="shape square" style={{ backgroundColor: selectedColor }}></div>
              <span>Square</span>
            </div>
            
            <div
              className="shape-item"
              draggable
              onDragStart={(e) => handleDragStart(e, 'circle')}
            >
              <div className="shape circle" style={{ backgroundColor: selectedColor }}></div>
              <span>Circle</span>
            </div>
            
            <div
              className="shape-item"
              draggable
              onDragStart={(e) => handleDragStart(e, 'triangle')}
            >
              <div 
                className="shape triangle" 
                style={{ 
                  borderBottomColor: selectedColor 
                }}
              ></div>
              <span>Triangle</span>
            </div>
            
            <div
              className="shape-item"
              draggable
              onDragStart={(e) => handleDragStart(e, 'trapezoid')}
            >
              <div 
                className="shape trapezoid" 
                style={{ 
                  borderBottomColor: selectedColor 
                }}
              ></div>
              <span>Trapezoid</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <p>Double-tap to delete shapes</p>
          </div>
        </aside>

        {/* Main canvas area */}
        <main
          className="canvas"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {shapes.length === 0 && (
            <div className="canvas-placeholder">
              <p>Drag shapes here to start drawing</p>
              <p className="hint">Double-click shapes to remove them</p>
            </div>
          )}
          {shapes.map(renderShape)}
        </main>
      </div>

      {/* Footer with shape counts and icons */}
      <footer className="footer">
        <div className="shape-counts">
          <div className="count-item">
            <div className="shape-icon square-icon"></div>
            <span>{shapeCounts.square} Squares</span>
          </div>
          <div className="count-item">
            <div className="shape-icon circle-icon"></div>
            <span>{shapeCounts.circle} Circles</span>
          </div>
          <div className="count-item">
            <div className="shape-icon triangle-icon"></div>
            <span>{shapeCounts.triangle} Triangles</span>
          </div>
          <div className="count-item">
            <div className="shape-icon trapezoid-icon"></div>
            <span>{shapeCounts.trapezoid} Trapezoids</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DrawingApp;

// Wrap in an immediately invoked function to avoid conflicts
(function() {
    // Wait until page is fully loaded
    window.addEventListener('load', function() {
      // Create cursor elements
      const cursor = document.createElement('div');
      cursor.classList.add('custom-cursor');
      cursor.style.position = 'fixed';
      cursor.style.width = '30px';
      cursor.style.height = '30px';
      cursor.style.borderRadius = '50%';
      cursor.style.border = '2px solid rgba(255, 255, 255, 0.7)';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '9999';
      cursor.style.transition = 'width 0.2s, height 0.2s';
      
      const cursorDot = document.createElement('div');
      cursorDot.classList.add('cursor-dot');
      cursorDot.style.position = 'fixed';
      cursorDot.style.width = '6px';
      cursorDot.style.height = '6px';
      cursorDot.style.backgroundColor = 'white';
      cursorDot.style.borderRadius = '50%';
      cursorDot.style.transform = 'translate(-50%, -50%)';
      cursorDot.style.pointerEvents = 'none';
      cursorDot.style.zIndex = '10000';
      
      // Add to body
      document.body.appendChild(cursor);
      document.body.appendChild(cursorDot);
      
      // Override default cursor
      const styleElement = document.createElement('style');
      styleElement.textContent = '* {cursor: none !important;}';
      document.head.appendChild(styleElement);
      
      // Track mouse movement
      document.addEventListener('mousemove', function(e) {
        requestAnimationFrame(function() {
          cursor.style.left = e.clientX + 'px';
          cursor.style.top = e.clientY + 'px';
          
          cursorDot.style.left = e.clientX + 'px';
          cursorDot.style.top = e.clientY + 'px';
        });
      });
      
      // Click animation
      document.addEventListener('mousedown', function() {
        cursor.style.width = '26px';
        cursor.style.height = '26px';
        cursor.style.borderColor = 'rgba(255, 102, 170, 0.8)';
      });
      
      document.addEventListener('mouseup', function() {
        cursor.style.width = '30px';
        cursor.style.height = '30px';
        cursor.style.borderColor = 'rgba(255, 255, 255, 0.7)';
      });
      
      console.log('Custom cursor initialized');
    });
  })();
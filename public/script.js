// Keyboard variables
let keyZ = false;
let keyX = false;
let keyboardMode = false;

// Game variables
let circles = [];
let sliders = [];
let score = 0;
let combo = 0;
let maxCombo = 0;
let hits300 = 0;
let hits100 = 0;
let hits50 = 0;
let hitsMiss = 0;
let totalHits = 0;
let totalScore = 0;
let gameStarted = false;
let gameEnded = false;
let difficulty = 'easy';
let currentSlider = null;
let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
let objectsSpawned = 0;
let lastX = null;
let lastY = null;
let missMessages = [
    "Uhh yesterday i accidentally called my teacher mom... :(",
    "Yesterday i was singing in the shower but my sibling recorded it.... how will i recover from this",
    "I accidentally liked a post from 2012 while stalking my crush's profile",
    "Uhmm i just sent a risky text but instead of sending it to the right person, I sent it to my mom..... :|",
    "Wait sorry the last email(s) wasn't supposed to be sent to u... pls ignore it :)",
    "I just showed my search history to an entire class of elementary school students... there was some... interesting stuff on it.",
    "I like you Cameron",
    "I accidentally liked my ex's new partner's post from five years ago..",
    "Hi... Long time no see, anyways, I just accidentally moaned while stretching in class. Everyone heard."
];
let lastInputType = 'mouse'; // Default to mouse
let inputTypeChanged = false;

// Game elements
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const comboElement = document.getElementById('combo');
const accuracyElement = document.getElementById('accuracy');

// Menu elements
const startMenu = document.getElementById('start-menu');
const resultsMenu = document.getElementById('results-menu');
const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// Result elements
const finalScoreElement = document.getElementById('final-score');
const finalAccuracyElement = document.getElementById('final-accuracy');
const maxComboElement = document.getElementById('max-combo');
const gradeElement = document.getElementById('grade');
const hits300Element = document.getElementById('hits-300');
const hits100Element = document.getElementById('hits-100');
const hits50Element = document.getElementById('hits-50');
const hitsMissElement = document.getElementById('hits-miss');

// Difficulty settings
const difficultySettings = {
    easy: {
        circleSize: 80,
        approachRate: 2000,
        spawnInterval: 1500,
        totalCircles: 20,
        sliderChance: 0.3
    },
    normal: {
        circleSize: 60,
        approachRate: 1200,
        spawnInterval: 1000,
        totalCircles: 40,
        sliderChance: 0.4
    },
    hard: {
        circleSize: 50,
        approachRate: 800,
        spawnInterval: 700,
        totalCircles: 60,
        sliderChance: 0.5
    }
};

// Main document ready handler - SINGLE unified handler
// Main document ready handler - SINGLE unified handler
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing game...");
    
    // Detect device type first
    detectTouchDevice();
    
    // Fix difficulty buttons
    fixDifficultyButtons();
    
    // Set up all event listeners
    setupEventListeners();
    
    // Add keyboard instructions to menu
    addKeyboardInstructions();
    
    // Add input type option to menu
    setTimeout(addInputOptionToMenu, 100);
    
    // Add background music
    addBrunoMarsMusic();
    
    console.log("Game initialization complete");
});

// Setup all event listeners
function setupEventListeners() {
    console.log("Setting up all event listeners");
    
    // Set up the enhanced input handlers
    setupInputHandlers();
    
    // Set up keyboard handlers
    setupKeyboardHandlers();
    
    // Start button
    if (startButton) {
        console.log("Adding start button listener");
        startButton.removeEventListener('click', startGame);
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Start button not found!");
    }
    
    // Retry button
    if (retryButton) {
        console.log("Adding retry button listener");
        retryButton.removeEventListener('click', resetGame);
        retryButton.addEventListener('click', resetGame);
    } else {
        console.error("Retry button not found!");
    }
    
    // Difficulty buttons
    if (difficultyButtons.length > 0) {
        console.log("Adding difficulty button listeners");
        difficultyButtons.forEach(button => {
            // Remove existing event listeners by cloning and replacing
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add the click event listener to the new button
            newButton.addEventListener('click', function() {
                console.log("Difficulty changed to:", newButton.dataset.difficulty);
                // Remove 'selected' class from all buttons
                document.querySelectorAll('.difficulty-btn').forEach(btn => 
                    btn.classList.remove('selected'));
                // Add 'selected' class to the clicked button
                newButton.classList.add('selected');
                // Update the difficulty variable
                difficulty = newButton.dataset.difficulty;
            });
        });
    } else {
        console.error("Difficulty buttons not found!");
    }
    
    console.log("Event listeners setup complete");
}

// Input handlers setup
function setupInputHandlers() {
    // First, remove ALL existing event listeners to prevent duplicates or conflicts
    gameContainer.removeEventListener('mousedown', onGameMouseDown);
    gameContainer.removeEventListener('mouseup', onGameMouseUp);
    gameContainer.removeEventListener('mousemove', onGameMouseMove);
    gameContainer.removeEventListener('pointerdown', onGamePointerDown);
    gameContainer.removeEventListener('pointerup', onGamePointerUp);
    gameContainer.removeEventListener('pointermove', onGamePointerMove);
    gameContainer.removeEventListener('touchstart', onGameTouchStart);
    gameContainer.removeEventListener('touchend', onGameTouchEnd);
    gameContainer.removeEventListener('touchmove', onGameTouchMove);
    
    // ONLY use pointer events - these work universally for mouse, pen and touch
    gameContainer.addEventListener('pointerdown', onGamePointerDown);
    gameContainer.addEventListener('pointerup', onGamePointerUp);
    gameContainer.addEventListener('pointermove', onGamePointerMove);
    
    console.log("Input handlers set up with unified pointer events");
}

// Keyboard handlers setup
function setupKeyboardHandlers() {
    // Remove any existing keyboard handlers to prevent duplicates
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    
    // Add keyboard event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    console.log("Keyboard handlers set up for Z and X keys");
}

// Detect touch device type
function detectTouchDevice() {
    // Check for presence of touchscreen capability
    const hasTouchScreen = (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
    );
    
    console.log("Touch device detected: " + hasTouchScreen);
    
    // Set default input type based on device
    if (hasTouchScreen) {
        lastInputType = 'tablet';
        console.log("Default input set to tablet due to touchscreen detection");
    } else {
        lastInputType = 'mouse';
        console.log("Default input set to mouse");
    }
}

// Initialize keyboard support
function initializeKeyboardSupport() {
    // Reset keyboard state
    keyZ = false;
    keyX = false;
    
    // Show instructions if in keyboard mode
    if (lastInputType === 'keyboard') {
        const reminder = document.createElement('div');
        reminder.className = 'keyboard-reminder';
        reminder.style.position = 'absolute';
        reminder.style.bottom = '20px';
        reminder.style.left = '50%';
        reminder.style.transform = 'translateX(-50%)';
        reminder.style.padding = '5px 15px';
        reminder.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        reminder.style.color = 'white';
        reminder.style.borderRadius = '5px';
        reminder.style.fontFamily = 'Arial';
        reminder.style.fontSize = '16px';
        reminder.style.zIndex = '50';
        reminder.innerHTML = 'Press <strong>Z</strong> or <strong>X</strong> to hit circles';
        
        gameContainer.appendChild(reminder);
        
        // Fade out after 5 seconds
        setTimeout(() => {
            reminder.style.transition = 'opacity 1s';
            reminder.style.opacity = '0';
            setTimeout(() => {
                if (reminder.parentNode) {
                    reminder.parentNode.removeChild(reminder);
                }
            }, 1000);
        }, 5000);
    }
}

// Start the game
function startGame() {
    console.log("Starting game with difficulty:", difficulty);
    
    // Make sure we don't start if already started
    if (gameStarted) {
        console.log("Game already started, ignoring duplicate start request");
        return;
    }
    
    gameStarted = true;
    gameEnded = false;
    startMenu.style.display = 'none';
    
    // Add the input type display
    addInputTypeDisplay();
    
    // Remove any existing game elements to prevent duplicates
    document.querySelectorAll('.circle, .approach-circle, .hit-circle, .slider-ball, .end-circle, svg').forEach(el => {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    
    // Reset game stats
    circles = [];
    sliders = [];
    score = 0;
    combo = 0;
    maxCombo = 0;
    hits300 = 0;
    hits100 = 0;
    hits50 = 0;
    hitsMiss = 0;
    totalHits = 0;
    totalScore = 0;
    currentSlider = null;
    objectsSpawned = 0;
    lastX = null;
    lastY = null;
    
    updateScore();
    updateCombo();
    updateAccuracy();
    
    // Initialize keyboard support
    initializeKeyboardSupport();
    
    // Start spawning hit objects - with proper clearing of previous timeouts
    if (window.spawnTimeout) {
        clearTimeout(window.spawnTimeout);
    }
    spawnNextObject();
}

// Helper function for input type display
function addInputTypeDisplay() {
    // Remove existing display if it exists
    const existingDisplay = document.getElementById('input-type-display');
    if (existingDisplay && existingDisplay.parentNode) {
        existingDisplay.parentNode.removeChild(existingDisplay);
    }
    
    const displayDiv = document.createElement('div');
    displayDiv.id = 'input-type-display';
    displayDiv.style.position = 'absolute';
    displayDiv.style.top = '140px';
    displayDiv.style.right = '20px';
    displayDiv.style.color = 'white';
    displayDiv.style.fontFamily = 'Arial';
    displayDiv.style.fontSize = '16px';
    displayDiv.style.fontWeight = 'bold';
    displayDiv.style.zIndex = '100';
    displayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    displayDiv.style.padding = '5px 10px';
    displayDiv.style.borderRadius = '5px';
    displayDiv.textContent = `Input: ${lastInputType.charAt(0).toUpperCase() + lastInputType.slice(1)}`;
    
    gameContainer.appendChild(displayDiv);
    
    // Create a toggle button to cycle through input modes
    const toggleButton = document.createElement('button');
    toggleButton.id = 'input-toggle';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '175px';
    toggleButton.style.right = '20px';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.backgroundColor = '#ff66aa';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.zIndex = '100';
    toggleButton.textContent = 'Change Input';
    
    toggleButton.addEventListener('click', () => {
        // Cycle between mouse, tablet, and keyboard
        if (lastInputType === 'mouse') {
            lastInputType = 'tablet';
            keyboardMode = false;
        } else if (lastInputType === 'tablet') {
            lastInputType = 'keyboard';
            keyboardMode = true;
        } else {
            lastInputType = 'mouse';
            keyboardMode = false;
        }
        
        inputTypeChanged = true;
        
        // Update the display
        const display = document.getElementById('input-type-display');
        if (display) {
            display.textContent = `Input: ${lastInputType.charAt(0).toUpperCase() + lastInputType.slice(1)}`;
            display.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
            setTimeout(() => {
                display.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            }, 1000);
        }
        
        console.log(`Switched input type to: ${lastInputType}`);
    });
    
    gameContainer.appendChild(toggleButton);
    
    // Add keyboard controls reminder if keyboard mode is active
    if (lastInputType === 'keyboard') {
        const keyReminder = document.createElement('div');
        keyReminder.id = 'key-reminder';
        keyReminder.style.position = 'absolute';
        keyReminder.style.top = '210px';
        keyReminder.style.right = '20px';
        keyReminder.style.color = 'white';
        keyReminder.style.fontFamily = 'Arial';
        keyReminder.style.fontSize = '14px';
        keyReminder.style.zIndex = '100';
        keyReminder.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        keyReminder.style.padding = '5px 10px';
        keyReminder.style.borderRadius = '5px';
        keyReminder.innerHTML = 'Press <strong>Z</strong> or <strong>X</strong> to hit';
        
        gameContainer.appendChild(keyReminder);
    }
}

// Add input option to menu
function addInputOptionToMenu() {
    const menuDiv = document.getElementById('start-menu');
    if (!menuDiv) return;
    
    // Create input selector
    const inputSelector = document.createElement('div');
    inputSelector.className = 'input-selector';
    inputSelector.style.marginBottom = '20px';
    inputSelector.innerHTML = `
        <p>Select input type:</p>
        <div class="input-buttons">
            <button class="input-btn ${lastInputType === 'mouse' ? 'selected' : ''}" data-input="mouse">Mouse</button>
            <button class="input-btn ${lastInputType === 'tablet' ? 'selected' : ''}" data-input="tablet">Tablet/Touch</button>
            <button class="input-btn ${lastInputType === 'keyboard' ? 'selected' : ''}" data-input="keyboard">Keyboard (Z/X)</button>
        </div>
    `;
    
    // Insert after difficulty selector
    const difficultySelector = document.querySelector('.difficulty-selector');
    if (difficultySelector && difficultySelector.nextSibling) {
        menuDiv.insertBefore(inputSelector, difficultySelector.nextSibling);
    } else {
        menuDiv.appendChild(inputSelector);
    }
    
    // Add event listeners
    const inputButtons = document.querySelectorAll('.input-btn');
    inputButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update selected button
            document.querySelectorAll('.input-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Update input type
            lastInputType = this.dataset.input;
            if (lastInputType === 'keyboard') {
                keyboardMode = true;
            } else {
                keyboardMode = false;
            }
            console.log(`Input type set to ${lastInputType} from menu`);
        });
    });
    
    // Add CSS for the input buttons
    const style = document.createElement('style');
    style.textContent = `
        .input-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .input-btn {
            background-color: #444;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            font-size: 16px;
            cursor: pointer;
        }
        .input-btn.selected {
            background-color: #ff66aa;
        }
    `;
    document.head.appendChild(style);
}

// Add keyboard instructions
function addKeyboardInstructions() {
    const startMenu = document.getElementById('start-menu');
    if (!startMenu) return;
    
    const instructionsP = startMenu.querySelector('p');
    if (instructionsP) {
        instructionsP.innerHTML = 'Click the circles to the beat!<br>Or use Z and X keys on your keyboard!';
    }
    
    // Add keyboard controls visual guide
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'keyboard-controls';
    controlsDiv.style.marginTop = '10px';
    controlsDiv.style.marginBottom = '15px';
    controlsDiv.innerHTML = `
        <div style="display: inline-block; margin: 0 10px;">
            <div style="background: #444; padding: 5px 15px; border-radius: 4px; display: inline-block; color: white; font-weight: bold;">Z</div>
            <span style="margin-left: 5px;">Hit</span>
        </div>
        <div style="display: inline-block; margin: 0 10px;">
            <div style="background: #444; padding: 5px 15px; border-radius: 4px; display: inline-block; color: white; font-weight: bold;">X</div>
            <span style="margin-left: 5px;">Hit</span>
        </div>
    `;
    
    // Insert after first paragraph
    if (instructionsP && instructionsP.nextSibling) {
        startMenu.insertBefore(controlsDiv, instructionsP.nextSibling);
    } else {
        startMenu.appendChild(controlsDiv);
    }
}

// Pointer event handlers
function onGamePointerDown(event) {
    if (!gameStarted || gameEnded) return;
    
    // Prevent default behavior - stops scrolling on touch devices
    event.preventDefault();
    
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    // Identify input type based on pointerType property
    // Standard values: mouse, pen, touch
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
        if (lastInputType !== 'tablet') {
            lastInputType = 'tablet';
            inputTypeChanged = true;
            console.log("Input type changed to tablet/touch:", event.pointerType);
        }
    } else {
        if (lastInputType !== 'mouse') {
            lastInputType = 'mouse';
            inputTypeChanged = true;
            console.log("Input type changed to mouse");
        }
    }
    
    // Log detailed input information
    console.log(`Input: ${lastInputType} at (${mouseX}, ${mouseY}), pointerType: ${event.pointerType}`);
    
    // Get appropriate click radius based on current input type
    let clickRadius = getClickRadius(lastInputType, difficulty);
    
    // Sort circles by creation time to ensure we hit the oldest first
    circles.sort((a, b) => a.createdAt - b.createdAt);
    
    // Check circles first
    let foundValidCircle = false;
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        if (circle.clicked || circle.missed) continue;
        
        const dx = mouseX - circle.x;
        const dy = mouseY - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Debug logging
        console.log(`Circle #${circle.number} check: distance=${distance.toFixed(2)}, threshold=${(circle.size * clickRadius).toFixed(2)}`);
        
        if (distance <= circle.size * clickRadius) {
            console.log(`✓ Hit circle #${circle.number}`);
            hitCircle(circle, distance);
            foundValidCircle = true;
            break;
        }
    }
}
    
// Only check sliders if no circle was hit
if (!foundValidCircle) {
    // Sort sliders by creation time
    sliders.sort((a, b) => a.createdAt - b.createdAt);
    
    for (let i = 0; i < sliders.length; i++) {
        const slider = sliders[i];
        if (slider.completed || slider.missed || slider.active) continue;
        
        const dx = mouseX - slider.startX;
        const dy = mouseY - slider.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Debug logging
        console.log(`Slider #${slider.number} check: distance=${distance.toFixed(2)}, threshold=${(slider.size * clickRadius).toFixed(2)}`);
        
        if (distance <= slider.size * clickRadius) {
            console.log(`✓ Hit slider #${slider.number}`);
            startSlider(slider, distance);
            break;
        }
    }
}

function onGamePointerUp(event) {
if (!gameStarted || gameEnded) return;

mouseDown = false;

// If we have an active slider, check if it should be released
if (currentSlider && currentSlider.active) {
    console.log(`Releasing slider #${currentSlider.number}`);
    releaseSlider(currentSlider);
}
}

function onGamePointerMove(event) {
mouseX = event.clientX;
mouseY = event.clientY;

// Update slider tracking if we're holding down on an active slider
if (mouseDown && currentSlider && currentSlider.active) {
    updateSliderWithCursor(currentSlider);
    updateSliderTracking(currentSlider);
}
}

// Keyboard event handlers
function onKeyDown(event) {
if (!gameStarted || gameEnded) return;

// Handle only Z and X keys (also support lowercase)
if (event.key === 'z' || event.key === 'Z') {
    if (!keyZ) { // Only trigger once for initial press
        keyZ = true;
        // Change to keyboard mode if it's the first keyboard input
        if (!keyboardMode) {
            keyboardMode = true;
            lastInputType = 'keyboard';
            inputTypeChanged = true;
            console.log("Input mode changed to keyboard");
            
            // Update input display if it exists
            const display = document.getElementById('input-type-display');
            if (display) {
                display.textContent = 'Input: Keyboard';
                display.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
                setTimeout(() => {
                    display.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }, 1000);
            }
        }
        // Simulate a click at the current cursor position
        simulateClickAtCursor();
    }
} else if (event.key === 'x' || event.key === 'X') {
    if (!keyX) { // Only trigger once for initial press
        keyX = true;
        // Change to keyboard mode if it's the first keyboard input
        if (!keyboardMode) {
            keyboardMode = true;
            lastInputType = 'keyboard';
            inputTypeChanged = true;
            console.log("Input mode changed to keyboard");
            
            // Update input display if it exists
            const display = document.getElementById('input-type-display');
            if (display) {
                display.textContent = 'Input: Keyboard';
                display.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
                setTimeout(() => {
                    display.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }, 1000);
            }
        }
        // Simulate a click at the current cursor position
        simulateClickAtCursor();
    }
}
}

function onKeyUp(event) {
if (event.key === 'z' || event.key === 'Z') {
    keyZ = false;
    
    // Only simulate mouse up if both keys are released and we have an active slider
    if (!keyX && currentSlider && currentSlider.active) {
        simulateMouseUp();
    }
} else if (event.key === 'x' || event.key === 'X') {
    keyX = false;
    
    // Only simulate mouse up if both keys are released and we have an active slider
    if (!keyZ && currentSlider && currentSlider.active) {
        simulateMouseUp();
    }
}
}

// Keyboard helper functions
function simulateClickAtCursor() {
// Ignore if game hasn't started or has ended
if (!gameStarted || gameEnded) return;

// Create a synthetic pointer event
const clickEvent = {
    clientX: mouseX,
    clientY: mouseY,
    pointerType: 'keyboard', // Use 'keyboard' as pointer type for tracking
    preventDefault: function() {}
};

// Call the same function that handles pointer down events
mouseDown = true;
onGamePointerDown(clickEvent);

console.log(`Keyboard click simulated at (${mouseX}, ${mouseY})`);
}

function simulateMouseUp() {
// Create a synthetic pointer event
const releaseEvent = {
    pointerType: 'keyboard',
    preventDefault: function() {}
};

// Call the same function that handles pointer up events
mouseDown = false;
onGamePointerUp(releaseEvent);

console.log("Keyboard release simulated");
}

// Unified click radius function for all input types
function getClickRadius(inputType, difficultyLevel) {
if (inputType === 'keyboard') {
    // Very forgiving hit detection for keyboard
    switch(difficultyLevel) {
        case 'easy':
            return 3.5;  // Extremely forgiving for easy mode
        case 'normal':
            return 3.0;  // Very forgiving for normal mode
        case 'hard':
            return 2.5;  // Quite forgiving even for hard mode
        default:
            return 3.0;
    }
} else if (inputType === 'tablet') {
    // Tablet settings
    switch(difficultyLevel) {
        case 'easy':
            return 3.0;  // Very forgiving for easy mode
        case 'normal':
            return 2.5;  // Very forgiving for normal mode
        case 'hard':
            return 2.0;  // Quite forgiving even for hard mode
        default:
            return 2.5;
    }
} else {
    // Mouse settings
    switch(difficultyLevel) {
        case 'easy':
            return 2.5;  // Very forgiving for easy mode
        case 'normal':
            return 2.0;  // More forgiving for normal mode
        case 'hard':
            return 1.7;  // More forgiving for hard mode
        default:
            return 2.0;
    }
}
}

// Timing windows function with support for all input types
function getTimingWindows(inputType, difficultyLevel, approachRate) {
const windows = {};

if (inputType === 'keyboard') {
    // More forgiving timing windows for keyboard
    switch(difficultyLevel) {
        case 'easy':
            windows.perfect = approachRate * 0.35; // 35% of approach rate
            windows.good = approachRate * 0.55;    // 55% of approach rate
            windows.ok = approachRate * 0.75;      // 75% of approach rate
            break;
        case 'normal':
            windows.perfect = approachRate * 0.30; // 30% of approach rate
            windows.good = approachRate * 0.50;    // 50% of approach rate
            windows.ok = approachRate * 0.70;      // 70% of approach rate
            break;
        case 'hard':
            windows.perfect = approachRate * 0.25; // 25% of approach rate
            windows.good = approachRate * 0.40;    // 40% of approach rate
            windows.ok = approachRate * 0.55;      // 55% of approach rate
            break;
        default:
            windows.perfect = approachRate * 0.30;
            windows.good = approachRate * 0.50;
            windows.ok = approachRate * 0.70;
    }
} else if (inputType === 'tablet') {
    // Tablet settings
    switch(difficultyLevel) {
        case 'easy':
            windows.perfect = approachRate * 0.30;
            windows.good = approachRate * 0.50;
            windows.ok = approachRate * 0.70;
            break;
        case 'normal':
            windows.perfect = approachRate * 0.25;
            windows.good = approachRate * 0.40;
            windows.ok = approachRate * 0.60;
            break;
        case 'hard':
            windows.perfect = approachRate * 0.18;
            windows.good = approachRate * 0.30;
            windows.ok = approachRate * 0.45;
            break;
        default:
            windows.perfect = approachRate * 0.25;
            windows.good = approachRate * 0.40;
            windows.ok = approachRate * 0.60;
    }
} else {
    // Mouse settings
    switch(difficultyLevel) {
        case 'easy':
            windows.perfect = approachRate * 0.22;
            windows.good = approachRate * 0.40;
            windows.ok = approachRate * 0.60;
            break;
        case 'normal':
            windows.perfect = approachRate * 0.15;
            windows.good = approachRate * 0.30;
            windows.ok = approachRate * 0.50;
            break;
        case 'hard':
            windows.perfect = approachRate * 0.10;
            windows.good = approachRate * 0.20;
            windows.ok = approachRate * 0.35;
            break;
        default:
            windows.perfect = approachRate * 0.15;
            windows.good = approachRate * 0.30;
            windows.ok = approachRate * 0.50;
    }
}

// Debug log the timing windows
console.log(`Timing windows for ${inputType} (${difficultyLevel}): Perfect=${windows.perfect.toFixed(0)}ms, Good=${windows.good.toFixed(0)}ms, OK=${windows.ok.toFixed(0)}ms`);

return windows;
}

// Simplified accuracy calculation
function updateAccuracy() {
// Calculate accuracy as a simple percentage of points earned
let accuracy = 100;

if (totalHits > 0) {
    // Calculate based on percentage of points - 300 is perfect, 0 is a miss
    const allHits = [];
    
    // Add each hit type to the array
    for (let i = 0; i < hits300; i++) allHits.push(100); // 100% for perfect hits
    for (let i = 0; i < hits100; i++) allHits.push(33.3); // 33.3% for 100 hits
    for (let i = 0; i < hits50; i++) allHits.push(16.7); // 16.7% for 50 hits
    for (let i = 0; i < hitsMiss; i++) allHits.push(0); // 0% for misses
    
    // Calculate average
    const sum = allHits.reduce((total, value) => total + value, 0);
    accuracy = sum / totalHits;
    
    console.log(`Simple accuracy: ${accuracy.toFixed(2)}% (${hits300} perfect, ${hits100} good, ${hits50} ok, ${hitsMiss} misses)`);
}

if (accuracyElement) {
    accuracyElement.textContent = accuracy.toFixed(2);
}
}

// Helper function for final accuracy calculation
function calculateFinalAccuracy() {
if (totalHits === 0) return 100;

// Use the same calculation as updateAccuracy
const allHits = [];

// Add each hit type to the array
for (let i = 0; i < hits300; i++) allHits.push(100); // 100% for perfect hits
for (let i = 0; i < hits100; i++) allHits.push(33.3); // 33.3% for 100 hits
for (let i = 0; i < hits50; i++) allHits.push(16.7); // 16.7% for 50 hits
for (let i = 0; i < hitsMiss; i++) allHits.push(0); // 0% for misses

// Calculate average
const sum = allHits.reduce((total, value) => total + value, 0);
return sum / totalHits;
}

function spawnNextObject() {
    if (!gameStarted || gameEnded) return;
    
    const settings = difficultySettings[difficulty];
    
    if (objectsSpawned >= settings.totalCircles) {
        // Check if all hit objects have been handled
        if (circles.length === 0 && sliders.length === 0) {
            endGame();
        }
        return;
    }
    
    // Decide whether to spawn a circle or a slider
    const isSlider = Math.random() < settings.sliderChance;
    
    if (isSlider) {
        createSlider();
    } else {
        createCircle();
    }
    
    objectsSpawned++;
    
    // Schedule next object spawn with a stored reference to clear if needed
    window.spawnTimeout = setTimeout(spawnNextObject, settings.spawnInterval);
}
function createCircle() {
    const settings = difficultySettings[difficulty];
    const circleId = Date.now() + Math.random().toString(36).substring(2, 8);
    const circleSize = settings.circleSize;
    
    // Padding to keep circles fully visible
    const padding = circleSize + 20;
    
    // Determine position - either base it on the last object or create a new one
    let x, y;
    
    if (lastX === null || lastY === null) {
        // First object or reset position - create random position
        x = padding + Math.random() * (gameContainer.clientWidth - 2 * padding);
        y = padding + Math.random() * (gameContainer.clientHeight - 2 * padding);
    } else {
        // Base new position on the last object's position
        // Maximum distance to move from last position
        const maxDistance = circleSize * 5;
        
        // Random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = circleSize * 2 + Math.random() * maxDistance;
        
        // Calculate new position
        x = lastX + Math.cos(angle) * distance;
        y = lastY + Math.sin(angle) * distance;
        
        // Keep in bounds
        x = Math.max(padding, Math.min(x, gameContainer.clientWidth - padding));
        y = Math.max(padding, Math.min(y, gameContainer.clientHeight - padding));
    }
    
    // Update last position
    lastX = x;
    lastY = y;
    
    // Create main circle
    const circleElement = document.createElement('div');
    circleElement.className = 'circle';
    circleElement.id = `circle-${circleId}`;
    circleElement.style.width = `${circleSize}px`;
    circleElement.style.height = `${circleSize}px`;
    circleElement.style.left = `${x}px`;
    circleElement.style.top = `${y}px`;
    circleElement.style.zIndex = "10";
    
    // Add circle number text
    const objectNumber = objectsSpawned;
    circleElement.textContent = objectNumber;
    
    // Create approach circle
    const approachCircleElement = document.createElement('div');
    approachCircleElement.className = 'approach-circle';
    approachCircleElement.id = `approach-${circleId}`;
    approachCircleElement.style.left = `${x}px`;
    approachCircleElement.style.top = `${y}px`;
    approachCircleElement.style.width = `${circleSize * 3}px`;
    approachCircleElement.style.height = `${circleSize * 3}px`;
    approachCircleElement.style.zIndex = "9";
    
    // Create hit circle center
    const hitCircleElement = document.createElement('div');
    hitCircleElement.className = 'hit-circle';
    hitCircleElement.style.left = `${x}px`;
    hitCircleElement.style.top = `${y}px`;
    hitCircleElement.style.zIndex = "11";
    
    // Add to the game container
    gameContainer.appendChild(circleElement);
    gameContainer.appendChild(approachCircleElement);
    gameContainer.appendChild(hitCircleElement);
    
    // Add to circles array
    const circle = {
        id: circleId,
        x: x,
        y: y,
        size: circleSize,
        clicked: false,
        missed: false,
        element: circleElement,
        approachElement: approachCircleElement,
        hitElement: hitCircleElement,
        createdAt: Date.now(),
        clickable: true,
        number: objectNumber
    };
    
    circles.push(circle);
    
    // Critical fix: Force a reflow before setting the transition
    // This ensures the browser registers the initial size before animation
    approachCircleElement.getBoundingClientRect();
    
    // Then set the transition and target size
    approachCircleElement.style.transition = `width ${settings.approachRate}ms linear, height ${settings.approachRate}ms linear`;
    approachCircleElement.style.width = `${circleSize}px`;
    approachCircleElement.style.height = `${circleSize}px`;
    
    // Auto miss if not clicked
    setTimeout(() => {
        if (!circle.clicked && !circle.missed) {
            missCircle(circle);
        }
    }, settings.approachRate + 200);
}
function createSlider() {
    const settings = difficultySettings[difficulty];
    const sliderId = Date.now() + Math.random().toString(36).substring(2, 8);
    const circleSize = settings.circleSize;
    
    // Slider parameters
    const sliderDuration = settings.approachRate * 1.5;
    
    // Padding to keep sliders fully visible
    const padding = circleSize * 2;
    
    // Determine start position
    let startX, startY;
    
    if (lastX === null || lastY === null) {
        // First object or reset position - create random position
        startX = padding + Math.random() * (gameContainer.clientWidth - 2 * padding);
        startY = padding + Math.random() * (gameContainer.clientHeight - 2 * padding);
    } else {
        // Base new position on the last object's position
        // Maximum distance to move from last position
        const maxDistance = circleSize * 5;
        
        // Random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = circleSize * 2 + Math.random() * maxDistance;
        
        // Calculate new position
        startX = lastX + Math.cos(angle) * distance;
        startY = lastY + Math.sin(angle) * distance;
        
        // Keep in bounds
        startX = Math.max(padding, Math.min(startX, gameContainer.clientWidth - padding));
        startY = Math.max(padding, Math.min(startY, gameContainer.clientHeight - padding));
    }
    
    // Create slider path
    const angle = Math.random() * Math.PI * 2;
    const distance = circleSize * 3 + Math.random() * (circleSize * 2); // Shorter sliders
    
    // Calculate end point
    let endX = startX + Math.cos(angle) * distance;
    let endY = startY + Math.sin(angle) * distance;
    
    // Keep end point in bounds
    endX = Math.max(padding, Math.min(endX, gameContainer.clientWidth - padding));
    endY = Math.max(padding, Math.min(endY, gameContainer.clientHeight - padding));
    
    // Update last position to the end of the slider
    lastX = endX;
    lastY = endY;
    
    const pathPoints = [[startX, startY], [endX, endY]];
    
    // Calculate path length for progress calculation
    const pathLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    
    // Create SVG for slider path
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("width", gameContainer.clientWidth);
    svgElement.setAttribute("height", gameContainer.clientHeight);
    svgElement.style.position = "absolute";
    svgElement.style.top = "0";
    svgElement.style.left = "0";
    svgElement.style.zIndex = "5";
    
    // Create path element
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("class", "slider-path");
    
    // Generate path
    const pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
    pathElement.setAttribute("d", pathD);
    pathElement.style.strokeWidth = `${circleSize}px`;
    
    svgElement.appendChild(pathElement);
    
    // Create slider start circle
    const startCircleElement = document.createElement('div');
    startCircleElement.className = 'circle';
    startCircleElement.id = `slider-start-${sliderId}`;
    startCircleElement.style.width = `${circleSize}px`;
    startCircleElement.style.height = `${circleSize}px`;
    startCircleElement.style.left = `${startX}px`;
    startCircleElement.style.top = `${startY}px`;
    startCircleElement.style.zIndex = "10";
    
    // Add circle number text
    const objectNumber = objectsSpawned;
    startCircleElement.textContent = objectNumber;
    
    // Create approach circle
    const approachCircleElement = document.createElement('div');
    approachCircleElement.className = 'approach-circle';
    approachCircleElement.id = `approach-${sliderId}`;
    approachCircleElement.style.left = `${startX}px`;
    approachCircleElement.style.top = `${startY}px`;
    approachCircleElement.style.width = `${circleSize * 3}px`;
    approachCircleElement.style.height = `${circleSize * 3}px`;
    approachCircleElement.style.zIndex = "9";
    
    // Create slider ball
    const sliderBallElement = document.createElement('div');
    sliderBallElement.className = 'slider-ball';
    sliderBallElement.id = `slider-ball-${sliderId}`;
    sliderBallElement.style.width = `${circleSize}px`;
    sliderBallElement.style.height = `${circleSize}px`;
    sliderBallElement.style.left = `${startX}px`;
    sliderBallElement.style.top = `${startY}px`;
    sliderBallElement.style.zIndex = "12";
    sliderBallElement.style.display = 'none';
    
    // Create end hit circle
    const endCircleElement = document.createElement('div');
    endCircleElement.className = 'end-circle';
    endCircleElement.id = `slider-end-${sliderId}`;
    endCircleElement.style.width = `${circleSize}px`;
    endCircleElement.style.height = `${circleSize}px`;
    endCircleElement.style.left = `${endX}px`;
    endCircleElement.style.top = `${endY}px`;
    endCircleElement.style.zIndex = "10";
    endCircleElement.style.border = "3px solid white";
    endCircleElement.style.borderRadius = "50%";
    endCircleElement.style.boxSizing = "border-box";
    endCircleElement.style.position = "absolute";
    endCircleElement.style.transform = "translate(-50%, -50%)";
    
    // Add to the game container
    gameContainer.appendChild(svgElement);
    gameContainer.appendChild(startCircleElement);
    gameContainer.appendChild(approachCircleElement);
    gameContainer.appendChild(sliderBallElement);
    gameContainer.appendChild(endCircleElement);
    
    // Create slider object
    const slider = {
        id: sliderId,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        pathPoints: pathPoints,
        pathLength: pathLength,
        size: circleSize,
        active: false,
        completed: false,
        missed: false,
        trackingSuccess: 0,
        clickPoints: [],
        pathElement: pathElement,
        svgElement: svgElement,
        startCircleElement: startCircleElement,
        approachElement: approachCircleElement,
        ballElement: sliderBallElement,
        endCircleElement: endCircleElement,
        createdAt: Date.now(),
        duration: sliderDuration,
        startedAt: null,
        progress: 0,
        lastMouseX: startX,
        lastMouseY: startY,
        cursorDriven: true, // Keep it cursor-driven
        reachedEnd: false,
        number: objectNumber
    };
    
    sliders.push(slider);
    
    // Critical fix: Force a reflow before setting the transition
    approachCircleElement.getBoundingClientRect();
    
    // Set the transition and target size
    approachCircleElement.style.transition = `width ${settings.approachRate}ms linear, height ${settings.approachRate}ms linear`;
    approachCircleElement.style.width = `${circleSize}px`;
    approachCircleElement.style.height = `${circleSize}px`;
    
    // Auto miss if not started
    setTimeout(() => {
        if (!slider.active && !slider.completed && !slider.missed) {
            missSlider(slider);
        }
    }, settings.approachRate + 200);
}

function onGameMouseDown(event) {
    if (!gameStarted || gameEnded) return;
    
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    // Detect input type based on event properties
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
        if (lastInputType !== 'tablet') {
            lastInputType = 'tablet';
            inputTypeChanged = true;
            console.log("Input type changed to tablet/touch");
        }
    } else {
        if (lastInputType !== 'mouse') {
            lastInputType = 'mouse';
            inputTypeChanged = true;
            console.log("Input type changed to mouse");
        }
    }
    
    // Get appropriate click radius based on input type and difficulty
    let clickRadius = getClickRadius(lastInputType, difficulty);
    
    console.log(`Click at (${mouseX},${mouseY}) using ${lastInputType}, clickRadius: ${clickRadius}`);
    
    // Sort circles by creation time to ensure we hit the oldest first
    circles.sort((a, b) => a.createdAt - b.createdAt);
    
    // Check circles first with appropriate detection
    let foundValidCircle = false;
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        if (circle.clicked || circle.missed) continue;
        
        const dx = mouseX - circle.x;
        const dy = mouseY - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= circle.size * clickRadius) {
            console.log(`Hit circle #${circle.number} at distance: ${distance.toFixed(2)}, threshold: ${(circle.size * clickRadius).toFixed(2)}`);
            hitCircle(circle, distance);
            foundValidCircle = true;
            break;
        }
    }
    
    // Only check sliders if no circle was hit
    if (!foundValidCircle) {
        // Also sort sliders by creation time
        sliders.sort((a, b) => a.createdAt - b.createdAt);
        
        for (let i = 0; i < sliders.length; i++) {
            const slider = sliders[i];
            if (slider.completed || slider.missed || slider.active) continue;
            
            const dx = mouseX - slider.startX;
            const dy = mouseY - slider.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= slider.size * clickRadius) {
                console.log(`Hit slider #${slider.number} at distance: ${distance.toFixed(2)}, threshold: ${(slider.size * clickRadius).toFixed(2)}`);
                startSlider(slider, distance);
                break;
            }
        }
    }
}

function onGameMouseUp(event) {
    console.log("Mouse up event triggered");
    if (!gameStarted || gameEnded) return;
    
    mouseDown = false;
    
    console.log("Mouse up, currentSlider:", currentSlider ? currentSlider.id : "none"); // Debug log
    
    if (currentSlider && currentSlider.active) {
        releaseSlider(currentSlider);
    }
}
function onGameMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    if (mouseDown && currentSlider && currentSlider.active) {
        // Use the updated function to constrain the ball to the slider path
        updateSliderWithCursor(currentSlider);
        
        // Check tracking
        updateSliderTracking(currentSlider);
    }
}
function hitCircle(circle, distance) {
    const settings = difficultySettings[difficulty];
    
    // Calculate timing
    const elapsedTime = Date.now() - circle.createdAt;
    const idealTime = settings.approachRate;
    const timingError = Math.abs(elapsedTime - idealTime);
    
    // Log info for debugging
    console.log(`Hit Circle #${circle.number}: timing=${elapsedTime}ms, ideal=${idealTime}ms, error=${timingError}ms, distance=${distance.toFixed(2)}px, input=${lastInputType}`);
    
    // Mark as clicked
    circle.clicked = true;
    circle.clickable = false;
    
    // Remove elements with fade out
    circle.element.style.opacity = 0;
    circle.approachElement.style.opacity = 0;
    circle.hitElement.style.opacity = 0;
    
    setTimeout(() => {
        if (circle.element.parentNode) {
            circle.element.parentNode.removeChild(circle.element);
            circle.approachElement.parentNode.removeChild(circle.approachElement);
            circle.hitElement.parentNode.removeChild(circle.hitElement);
        }
    }, 100);
    
    // Remove from circles array
    circles = circles.filter(c => c.id !== circle.id);
    
    // Calculate score and accuracy based primarily on timing
    let hitValue = 0;
    let hitText = '';
    
    // Get timing windows based on input type and difficulty
    const timingWindows = getTimingWindows(lastInputType, difficulty, settings.approachRate);
    
    console.log(`Scoring windows for ${lastInputType} - Perfect: ${timingWindows.perfect}ms, Good: ${timingWindows.good}ms, OK: ${timingWindows.ok}ms`);
    
    // Score primarily based on timing (like real Osu)
    if (timingError <= timingWindows.perfect) {
        hitValue = 300;
        hitText = '300';
        hits300++;
        combo++;
    } else if (timingError <= timingWindows.good) {
        hitValue = 100;
        hitText = '100';
        hits100++;
        combo++;
    } else if (timingError <= timingWindows.ok) {
        hitValue = 50;
        hitText = '50';
        hits50++;
        combo++;
    } else {
        hitValue = 0;
        hitText = 'miss';
        hitsMiss++;
        combo = 0;
    }
    
    // Update max combo
    if (combo > maxCombo) {
        maxCombo = combo;
    }
    
    // Calculate combo multiplier like real Osu!
    const comboMultiplier = 1 + Math.min(4.5, combo / 10);  // Cap at 5.5x multiplier
    
    // Apply the combo multiplier
    const pointsGained = Math.floor(hitValue * comboMultiplier);
    score += pointsGained;
    totalScore += hitValue; // Keep raw score for accuracy calculation
    totalHits++;
    
    // Update display
    updateScore();
    updateCombo();
    updateAccuracy();
    showHitFeedback(circle.x, circle.y, hitText);
    
    // Check if game should end
    checkGameEnd();
}


function startSlider(slider, distance) {
    const settings = difficultySettings[difficulty];
    
    // Calculate timing
    const elapsedTime = Date.now() - slider.createdAt;
    const idealTime = settings.approachRate;
    const timingError = Math.abs(elapsedTime - idealTime);
    
    console.log(`Start Slider #${slider.number}: timing=${elapsedTime}ms, ideal=${idealTime}ms, error=${timingError}ms, distance=${distance.toFixed(2)}px`);
    
    // Mark slider as active
    slider.active = true;
    slider.startedAt = Date.now();
    currentSlider = slider;
    
    // Initialize cursor position tracking
    slider.lastMouseX = mouseX;
    slider.lastMouseY = mouseY;
    
    // Hide approach circle and start circle
    slider.approachElement.style.opacity = 0;
    slider.startCircleElement.style.opacity = 0;
    
    // Show slider ball
    slider.ballElement.style.display = 'flex';
    
    // Start with the ball at the slider start point
    slider.ballElement.style.left = `${slider.startX}px`;
    slider.ballElement.style.top = `${slider.startY}px`;
    
    // IMPORTANT: We're only giving initial hit points for the start of the slider
    // No completion points are granted yet - these will only be given if the player
    // successfully drags to the end
    
    let hitText = '';
    
    // Adjust timing windows based on difficulty - match the circle windows
    let timingWindows;
    if (difficulty === 'easy') {
        timingWindows = {
            perfect: idealTime * 0.25,
            good: idealTime * 0.40,
            ok: idealTime * 0.60
        };
    } else if (difficulty === 'normal') {
        timingWindows = {
            perfect: idealTime * 0.15,
            good: idealTime * 0.30,
            ok: idealTime * 0.50
        };
    } else { // hard
        timingWindows = {
            perfect: idealTime * 0.10,
            good: idealTime * 0.20,
            ok: idealTime * 0.35
        };
    }
    
    // Just showing feedback for the initial hit, but not adding to score yet
    if (timingError <= timingWindows.perfect) {
        hitText = '300';
    } else if (timingError <= timingWindows.good) {
        hitText = '100';
    } else if (timingError <= timingWindows.ok) {
        hitText = '50';
    } else {
        hitText = 'miss';
    }
    
    // Show hit feedback for slider start
    showHitFeedback(slider.startX, slider.startY, hitText);
    
    // Start checking for completion
    checkSliderCompletion(slider);
}
// New function to update slider position based on cursor
function updateSliderWithCursor(slider) {
    // Calculate vector from start to end point
    const vx = slider.endX - slider.startX;
    const vy = slider.endY - slider.startY;
    
    // Calculate the position of the mouse relative to the start point
    const mx = mouseX - slider.startX;
    const my = mouseY - slider.startY;
    
    // Calculate the projection of the mouse position onto the slider line
    const dotProduct = mx * vx + my * vy;
    const lineLength = vx * vx + vy * vy;
    const ratio = Math.max(0, Math.min(1, dotProduct / lineLength));
    
    // Calculate the constrained position on the slider line
    const projectedX = slider.startX + vx * ratio;
    const projectedY = slider.startY + vy * ratio;
    
    // Update the ball position to follow the cursor (constrained to the line)
    slider.ballElement.style.left = `${projectedX}px`;
    slider.ballElement.style.top = `${projectedY}px`;
    
    // Calculate progress along the slider (0 to 1)
    slider.progress = ratio;
    
    // Check if we've reached the end of the slider
    if (ratio >= 0.95 && !slider.reachedEnd) {
        slider.reachedEnd = true;
        completeSlider(slider);
    }
}


// Function to check if slider should be completed
function checkSliderCompletion(slider) {
    if (!slider.active || slider.completed || slider.missed) return;
    
    // Adjust timeout duration based on difficulty
    let timeoutMultiplier;
    
    if (difficulty === 'easy') {
        timeoutMultiplier = 3.0;  // More time for easy mode
    } else if (difficulty === 'normal') {
        timeoutMultiplier = 2.5;
    } else {
        timeoutMultiplier = 2.0;  // Original value for hard mode
    }
    
    // Check if slider has timed out (user took too long)
    const now = Date.now();
    const elapsedTime = now - slider.startedAt;
    const timeoutDuration = slider.duration * timeoutMultiplier;
    
    if (elapsedTime > timeoutDuration) {
        // User took too long
        if (difficulty === 'easy') {
            // In easy mode, we'll always give at least a 50 point hit even if timeout
            slider.trackingSuccess = Math.max(slider.trackingSuccess, 30);
            completeSlider(slider);
        } else {
            // Count as a miss in normal and hard modes
            missSlider(slider);
        }
        return;
    }
    
    // Continue checking for completion
    requestAnimationFrame(() => checkSliderCompletion(slider));
}

function updateSliderTracking(slider) {
    if (!slider.active || !mouseDown) return;
    
    // Calculate distance from mouse to current slider ball position
    const ballX = parseFloat(slider.ballElement.style.left);
    const ballY = parseFloat(slider.ballElement.style.top);
    
    const dx = mouseX - ballX;
    const dy = mouseY - ballY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Adjust tracking distance threshold based on difficulty
    let trackingThreshold;
    
    if (difficulty === 'easy') {
        trackingThreshold = 2.5;  // More lenient tracking for easy mode
    } else if (difficulty === 'normal') {
        trackingThreshold = 2.0;
    } else {
        trackingThreshold = 1.5;  // Original value for hard mode
    }
    
    // Check if mouse is close enough to the ball
    const isTracking = distance <= slider.size * trackingThreshold;
    
    // Record tracking data point
    slider.clickPoints.push(isTracking);
    
    // Update tracking success percentage
    const totalPoints = slider.clickPoints.length;
    const successPoints = slider.clickPoints.filter(point => point).length;
    slider.trackingSuccess = totalPoints > 0 ? (successPoints / totalPoints) * 100 : 0;
    
    // Visual feedback of tracking
    slider.ballElement.style.backgroundColor = isTracking ? 
        'rgba(255, 255, 255, 0.5)' : 'rgba(255, 100, 100, 0.5)';
}

function releaseSlider(slider) {
    if (!slider.active) return;
    
    // For cursor-driven sliders, check if close to end point
    if (slider.cursorDriven) {
        const dx = parseFloat(slider.ballElement.style.left) - slider.endX;
        const dy = parseFloat(slider.ballElement.style.top) - slider.endY;
        const distanceToEnd = Math.sqrt(dx * dx + dy * dy);
        
        // Adjust completion distance threshold based on difficulty
        let completionThreshold;
        
        if (difficulty === 'easy') {
            completionThreshold = 2.5;  // More lenient for easy mode
        } else if (difficulty === 'normal') {
            completionThreshold = 2.0;
        } else {
            completionThreshold = 1.5;  // Original value for hard mode
        }
        
        if (distanceToEnd <= slider.size * completionThreshold) {
            // Close enough to end point, count as completion
            completeSlider(slider);
        } else {
            // Released too far from end point, count as miss
            
            // In easy mode, we'll always give at least a 50 point hit
            if (difficulty === 'easy') {
                // Force a minimum score instead of a complete miss
                slider.trackingSuccess = Math.max(slider.trackingSuccess, 30);
                completeSlider(slider);
            } else {
                missSlider(slider);
            }
        }
    } else {
        // Original logic for automatic sliders
        const now = Date.now();
        const elapsedTime = now - slider.startedAt;
        const progress = Math.min(elapsedTime / slider.duration, 1);
        
        // Adjust completion progress threshold based on difficulty
        let progressThreshold;
        
        if (difficulty === 'easy') {
            progressThreshold = 0.7;  // More lenient for easy mode
        } else if (difficulty === 'normal') {
            progressThreshold = 0.8;
        } else {
            progressThreshold = 0.9;  // Original value for hard mode
        }
        
        if (progress >= progressThreshold) {
            // Allow completion if close to the end
            completeSlider(slider);
        } else {
            // Mark as missed if released too early, except in easy mode
            if (difficulty === 'easy') {
                // Force a minimum score instead of a complete miss
                slider.trackingSuccess = Math.max(slider.trackingSuccess, 30);
                completeSlider(slider);
            } else {
                missSlider(slider);
            }
        }
    }
}

function completeSlider(slider) {
    if (slider.completed || slider.missed) return;
    
    slider.active = false;
    slider.completed = true;
    
    // Calculate if the player successfully reached the end of the slider
    const ballX = parseFloat(slider.ballElement.style.left);
    const ballY = parseFloat(slider.ballElement.style.top);
    
    const dx = ballX - slider.endX;
    const dy = ballY - slider.endY;
    const distanceToEnd = Math.sqrt(dx * dx + dy * dy);
    
    // Adjust threshold based on difficulty
    let endThreshold;
    if (difficulty === 'easy') {
        endThreshold = slider.size * 1.5;
    } else if (difficulty === 'normal') {
        endThreshold = slider.size * 1.2;
    } else {
        endThreshold = slider.size;
    }
    
    // Only count as a full completion if the player got to the end
    const reachedEnd = distanceToEnd <= endThreshold || slider.progress >= 0.95;
    
    // Calculate score based on tracking accuracy AND reaching the end point
    let hitValue = 0;
    let hitText = '';
    
    if (reachedEnd) {
        // Player successfully reached the end
        if (difficulty === 'easy') {
            hitValue = 300;
            hitText = '300';
            hits300++;
            combo++;
        } else if (difficulty === 'normal') {
            // More lenient for normal mode
            if (slider.trackingSuccess >= 60) {
                hitValue = 300;
                hitText = '300';
                hits300++;
                combo++;
            } else if (slider.trackingSuccess >= 40) {
                hitValue = 100;
                hitText = '100';
                hits100++;
                combo++;
            } else {
                hitValue = 50;
                hitText = '50';
                hits50++;
                combo++;
            }
        } else {
            // Hard mode uses original logic
            if (slider.trackingSuccess >= 90) {
                hitValue = 300;
                hitText = '300';
                hits300++;
                combo++;
            } else if (slider.trackingSuccess >= 70) {
                hitValue = 100;
                hitText = '100';
                hits100++;
                combo++;
            } else if (slider.trackingSuccess >= 40) {
                hitValue = 50;
                hitText = '50';
                hits50++;
                combo++;
            } else {
                hitValue = 0;
                hitText = 'miss';
                hitsMiss++;
                combo = 0;
            }
        }
    } else {
        // Player didn't reach the end, count as a miss
        hitValue = 0;
        hitText = 'miss';
        hitsMiss++;
        combo = 0;
    }
    
    // Remove slider elements
    fadeOutSlider(slider);
    
    // Update max combo
    if (combo > maxCombo) {
        maxCombo = combo;
    }
    
    // Calculate combo multiplier like real Osu!
    const comboMultiplier = 1 + Math.min(4.5, combo / 10);  // Cap at 5.5x multiplier
    
    // Update score with combo multiplier
    const pointsGained = Math.floor(hitValue * comboMultiplier);
    score += pointsGained;
    totalScore += hitValue; // Raw score for accuracy calculation
    totalHits++;
    
    console.log(`Slider completed: ${hitValue} points × ${comboMultiplier.toFixed(2)} multiplier = ${pointsGained} points (combo: ${combo})`);
    
    // Show feedback at the end of the slider
    showHitFeedback(slider.endX, slider.endY, hitText);
    
    // Update display
    updateScore();
    updateCombo();
    updateAccuracy();
    
    // Remove from active slider
    if (currentSlider === slider) {
        currentSlider = null;
    }
    
    // Check if game should end
    checkGameEnd();
}
function missSlider(slider) {
    if (slider.completed || slider.missed) return;
    
    slider.active = false;
    slider.missed = true;
    
    // Remove slider elements
    fadeOutSlider(slider);
    
    // Update stats
    hitsMiss++;
    combo = 0;
    totalHits++;
    
    // Show miss feedback
    let feedbackX, feedbackY;
    
    if (slider.active) {
        // If the slider was active, show feedback at current ball position
        feedbackX = parseFloat(slider.ballElement.style.left);
        feedbackY = parseFloat(slider.ballElement.style.top);
    } else {
        // Otherwise show at start position
        feedbackX = slider.startX;
        feedbackY = slider.startY;
    }
    
    showHitFeedback(feedbackX, feedbackY, 'miss');
    
    // Update display
    updateCombo();
    updateAccuracy();
    
    // Remove from active slider
    if (currentSlider === slider) {
        currentSlider = null;
    }
    
    // Report miss to email system
    reportMissToEmail('slider');
    
    // Check if game should end
    checkGameEnd();
}

function fadeOutSlider(slider) {
    // Fade out all slider elements
    slider.svgElement.style.opacity = 0;
    slider.ballElement.style.opacity = 0;
    
    if (slider.startCircleElement.parentNode) {
        slider.startCircleElement.style.opacity = 0;
    }
    
    if (slider.approachElement.parentNode) {
        slider.approachElement.style.opacity = 0;
    }
    
    if (slider.endCircleElement.parentNode) {
        slider.endCircleElement.style.opacity = 0;
    }
    
    // Remove from DOM after fade
    setTimeout(() => {
        if (slider.svgElement.parentNode) {
            slider.svgElement.parentNode.removeChild(slider.svgElement);
        }
        
        if (slider.ballElement.parentNode) {
            slider.ballElement.parentNode.removeChild(slider.ballElement);
        }
        
        if (slider.startCircleElement.parentNode) {
            slider.startCircleElement.parentNode.removeChild(slider.startCircleElement);
        }
        
        if (slider.approachElement.parentNode) {
            slider.approachElement.parentNode.removeChild(slider.approachElement);
        }
        
        if (slider.endCircleElement.parentNode) {
            slider.endCircleElement.parentNode.removeChild(slider.endCircleElement);
        }
    }, 100);
    
    // Remove from sliders array
    sliders = sliders.filter(s => s.id !== slider.id);
}

function missCircle(circle) {
    // Mark as missed
    circle.missed = true;
    circle.clickable = false;
    
    // Remove elements with fade out
    circle.element.style.opacity = 0;
    circle.approachElement.style.opacity = 0;
    circle.hitElement.style.opacity = 0;
    
    setTimeout(() => {
        if (circle.element.parentNode) {
            circle.element.parentNode.removeChild(circle.element);
            circle.approachElement.parentNode.removeChild(circle.approachElement);
            circle.hitElement.parentNode.removeChild(circle.hitElement);
        }
    }, 100);
    
    // Remove from circles array
    circles = circles.filter(c => c.id !== circle.id);
    
    // Update stats
    hitsMiss++;
    combo = 0;
    totalHits++;
    
    // Update display
    updateCombo();
    updateAccuracy();
    showHitFeedback(circle.x, circle.y, 'miss');
    
    // Report miss to email system
    reportMissToEmail('circle');
    
    // Check if game should end
    checkGameEnd();
}

function showHitFeedback(x, y, hitText) {
    const feedback = document.createElement('div');
    feedback.className = `hit-feedback hit-${hitText}`;
    feedback.textContent = hitText;
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    
    gameContainer.appendChild(feedback);
    
    // Remove after animation completes
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 500);
}

function updateScore() {
    if (scoreElement) {
        scoreElement.textContent = score.toLocaleString();
    }
}

function updateCombo() {
    if (comboElement) {
        // Calculate the current combo multiplier
        const comboMultiplier = combo > 0 ? (1 + Math.min(4.5, combo / 10)).toFixed(2) : "1.00";
        
        // Display both combo count and multiplier
        comboElement.textContent = `${combo} (${comboMultiplier}x)`;
    }
}
function updateAccuracy() {
    // Calculate accuracy as a simple percentage of points earned
    let accuracy = 100;
    
    if (totalHits > 0) {
        // Calculate based on percentage of points - 300 is perfect, 0 is a miss
        const allHits = [];
        
        // Add each hit type to the array
        for (let i = 0; i < hits300; i++) allHits.push(100); // 100% for perfect hits
        for (let i = 0; i < hits100; i++) allHits.push(33.3); // 33.3% for 100 hits
        for (let i = 0; i < hits50; i++) allHits.push(16.7); // 16.7% for 50 hits
        for (let i = 0; i < hitsMiss; i++) allHits.push(0); // 0% for misses
        
        // Calculate average
        const sum = allHits.reduce((total, value) => total + value, 0);
        accuracy = sum / totalHits;
        
        console.log(`Simple accuracy: ${accuracy.toFixed(2)}% (${hits300} perfect, ${hits100} good, ${hits50} ok, ${hitsMiss} misses)`);
    }
    
    if (accuracyElement) {
        accuracyElement.textContent = accuracy.toFixed(2);
    }
}

function checkGameEnd() {
    const settings = difficultySettings[difficulty];
    // End game if all objects have been processed and we've reached the total count
    if (circles.length === 0 && sliders.length === 0 && 
        totalHits >= settings.totalCircles) {
        endGame();
    }
}

function calculateGrade() {
    if (totalHits === 0) return 'D';
    
    const accuracy = calculateFinalAccuracy();
    
    // Calculate grade based on accuracy and miss count
    if (accuracy > 95 && hitsMiss === 0) {
        return 'S';
    } else if (accuracy > 90 && hitsMiss <= 2) {
        return 'A';
    } else if (accuracy > 80) {
        return 'B';
    } else if (accuracy > 70) {
        return 'C';
    } else {
        return 'D';
    }
}
function endGame() {
    gameEnded = true;
    
    // Update results screen
    finalScoreElement.textContent = score.toLocaleString();
    maxComboElement.textContent = maxCombo;
    
    // Calculate final accuracy using the simple method
    const accuracy = calculateFinalAccuracy();
    finalAccuracyElement.textContent = accuracy.toFixed(2);
    
    hits300Element.textContent = hits300;
    hits100Element.textContent = hits100;
    hits50Element.textContent = hits50;
    hitsMissElement.textContent = hitsMiss;
    
    // Set grade
    const grade = calculateGrade();
    gradeElement.textContent = grade;
    gradeElement.className = `grade grade-${grade.toLowerCase()}`;
    
    // Show results screen
    resultsMenu.style.display = 'block';
}
function resetGame() {
    // Cancel any pending object spawns
    if (window.spawnTimeout) {
        clearTimeout(window.spawnTimeout);
        window.spawnTimeout = null;
    }
    
    // Mark game as not started to prevent duplicate startGame calls
    gameStarted = false;
    gameEnded = false;
    
    // Clear any remaining hit objects
    circles.forEach(circle => {
        if (circle.element.parentNode) {
            circle.element.parentNode.removeChild(circle.element);
            circle.approachElement.parentNode.removeChild(circle.approachElement);
            circle.hitElement.parentNode.removeChild(circle.hitElement);
        }
    });
    
    sliders.forEach(slider => {
        if (slider.svgElement.parentNode) {
            slider.svgElement.parentNode.removeChild(slider.svgElement);
        }
        
        if (slider.ballElement.parentNode) {
            slider.ballElement.parentNode.removeChild(slider.ballElement);
        }
        
        if (slider.startCircleElement.parentNode) {
            slider.startCircleElement.parentNode.removeChild(slider.startCircleElement);
        }
        
        if (slider.approachElement.parentNode) {
            slider.approachElement.parentNode.removeChild(slider.approachElement);
        }
        
        if (slider.endCircleElement && slider.endCircleElement.parentNode) {
            slider.endCircleElement.parentNode.removeChild(slider.endCircleElement);
        }
    });
    
    // Reset all arrays
    circles = [];
    sliders = [];
    
    // Remove any remaining hit feedback elements
    document.querySelectorAll('.hit-feedback').forEach(el => {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    
    // Hide results screen
    resultsMenu.style.display = 'none';
    
    // Show start menu
    startMenu.style.display = 'block';
}

// Report miss to email system
function reportMissToEmail(missType) {
    // Get a random message from the array
    const randomIndex = Math.floor(Math.random() * missMessages.length);
    const message = missMessages[randomIndex];
    
    console.log("Attempting to report miss to email system:", missType, message);
    
    // Send to backend API for email sending
    fetch('/api/miss-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            missType: missType,
            gameMode: difficulty,
            score: score,
            combo: combo
        })
    })
    .then(response => {
        console.log("Email API response status:", response.status);
        if (!response.ok) {
            console.error('Failed to send miss event for email');
        }
        return response.json();
    })
    .then(data => {
        console.log("Email API response data:", data);
        if (data.success) {
            console.log('Email notification sent successfully');
        } else {
            console.warn('Failed to send email notification:', data.message);
        }
    })
    .catch(error => console.error('Error sending miss event:', error));
}
// Window resize handler to ensure elements stay within bounds
window.addEventListener('resize', () => {
    circles.forEach(circle => {
        // Keep circles in bounds after resize
        const padding = circle.size;
        
        let x = parseFloat(circle.element.style.left);
        let y = parseFloat(circle.element.style.top);
        
        x = Math.min(Math.max(x, padding), gameContainer.clientWidth - padding);
        y = Math.min(Math.max(y, padding), gameContainer.clientHeight - padding);
        
        circle.x = x;
        circle.y = y;
        
        circle.element.style.left = `${x}px`;
        circle.element.style.top = `${y}px`;
        circle.approachElement.style.left = `${x}px`;
        circle.approachElement.style.top = `${y}px`;
        circle.hitElement.style.left = `${x}px`;
        circle.hitElement.style.top = `${y}px`;
    });
    
    // Adjust sliders if needed
    sliders.forEach(slider => {
        const padding = slider.size;
        
        // Just adjust slider start for simplicity
        let x = parseFloat(slider.startCircleElement.style.left);
        let y = parseFloat(slider.startCircleElement.style.top);
        
        x = Math.min(Math.max(x, padding), gameContainer.clientWidth - padding);
        y = Math.min(Math.max(y, padding), gameContainer.clientHeight - padding);
        
        slider.startX = x;
        slider.startY = y;
        
        slider.startCircleElement.style.left = `${x}px`;
        slider.startCircleElement.style.top = `${y}px`;
        slider.approachElement.style.left = `${x}px`;
        slider.approachElement.style.top = `${y}px`;
    });
});

// Function to animate automatic sliders (if needed)
function animateSlider(slider) {
    function updateSliderPosition() {
        if (!slider.active || slider.completed || slider.missed) return;
        
        const now = Date.now();
        const elapsedTime = now - slider.startedAt;
        const progress = Math.min(elapsedTime / slider.duration, 1);
        slider.progress = progress;
        
        // Simple linear interpolation for the ball position
        const startX = slider.pathPoints[0][0];
        const startY = slider.pathPoints[0][1];
        const endX = slider.pathPoints[1][0];
        const endY = slider.pathPoints[1][1];
        
        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress;
        
        // Update slider ball position
        slider.ballElement.style.left = `${x}px`;
        slider.ballElement.style.top = `${y}px`;
        
        // Check slider tracking
        updateSliderTracking(slider);
        
        // Continue animation or complete slider
        if (progress < 1) {
            requestAnimationFrame(updateSliderPosition);
        } else {
            completeSlider(slider);
        }
    }
    
    // Start the animation
    requestAnimationFrame(updateSliderPosition);
}
// Add this function to your script.js file
function fixDifficultyButtons() {
    console.log("Fixing difficulty buttons");
    
    // First, remove any event listeners by replacing each button with a clone
    const difficultySelector = document.querySelector('.difficulty-selector');
    if (!difficultySelector) {
        console.error("Difficulty selector not found!");
        return;
    }
    
    // Get original buttons and create new container
    const buttons = document.querySelectorAll('.difficulty-btn');
    const newContainer = difficultySelector.cloneNode(false);
    
    // Create new buttons and add them to the container
    buttons.forEach(button => {
        const newButton = document.createElement('button');
        newButton.className = 'difficulty-btn';
        if (button.classList.contains('selected')) {
            newButton.classList.add('selected');
        }
        newButton.dataset.difficulty = button.dataset.difficulty;
        newButton.textContent = button.textContent;
        
        // Add direct click handler
        newButton.onclick = function() {
            const diff = this.dataset.difficulty;
            console.log("Difficulty button clicked:", diff);
            
            // Remove selected class from all buttons
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add selected class to this button
            this.classList.add('selected');
            
            // Update difficulty variable
            difficulty = diff;
            console.log("Difficulty set to:", difficulty);
        };
        
        newContainer.appendChild(newButton);
    });
    
    // Replace the old container with the new one
    difficultySelector.parentNode.replaceChild(newContainer, difficultySelector);
    console.log("Difficulty buttons fixed!");
}

// Then, call this function right after your DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, fixing difficulty buttons and setting up event listeners");
    fixDifficultyButtons();
    setupEventListeners();
});
// Add this to test if the CSS is applied correctly
function verifyCssForDifficultyButtons() {
    console.log("Verifying CSS for difficulty buttons");
    
    // Get all difficulty buttons
    const buttons = document.querySelectorAll('.difficulty-btn');
    
    // Check each button
    buttons.forEach(button => {
        const isSelected = button.classList.contains('selected');
        const computedStyle = window.getComputedStyle(button);
        const backgroundColor = computedStyle.backgroundColor;
        
        console.log(`Button: ${button.textContent}`);
        console.log(`  - Has 'selected' class: ${isSelected}`);
        console.log(`  - Background color: ${backgroundColor}`);
        console.log(`  - Full class list: ${button.className}`);
    });
    
    // Verify the CSS rule exists
    const allStyleSheets = Array.from(document.styleSheets);
    let foundSelectedRule = false;
    
    for (const sheet of allStyleSheets) {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            for (const rule of rules) {
                if (rule.selectorText && rule.selectorText.includes('.difficulty-btn.selected')) {
                    console.log("Found CSS rule for .difficulty-btn.selected:");
                    console.log(`  - ${rule.selectorText} { ${rule.style.cssText} }`);
                    foundSelectedRule = true;
                }
            }
        } catch (e) {
            console.log("Could not access rules for a stylesheet (likely CORS issue)");
        }
    }
    
    if (!foundSelectedRule) {
        console.log("WARNING: Could not find CSS rule for .difficulty-btn.selected");
    }
}

// Call this function after a short delay to ensure CSS is loaded
setTimeout(verifyCssForDifficultyButtons, 1000);
document.removeEventListener('DOMContentLoaded', setupEventListeners);
document.addEventListener('DOMContentLoaded', function onDocumentLoaded() {
    console.log("DOM loaded, setting up event listeners (one-time setup)");
    // Run setup only once
    setupEventListeners();
    // Remove this listener to ensure it doesn't run again
    document.removeEventListener('DOMContentLoaded', onDocumentLoaded);
});
function setupInputHandlers() {
    // Remove any existing handlers to prevent duplicates
    gameContainer.removeEventListener('mousedown', onGameMouseDown);
    gameContainer.removeEventListener('mouseup', onGameMouseUp);
    gameContainer.removeEventListener('mousemove', onGameMouseMove);
    gameContainer.removeEventListener('pointerdown', onGamePointerDown);
    gameContainer.removeEventListener('pointerup', onGamePointerUp);
    gameContainer.removeEventListener('pointermove', onGamePointerMove);
    
    // Use pointer events instead of mouse events (more universal)
    gameContainer.addEventListener('pointerdown', onGamePointerDown);
    gameContainer.addEventListener('pointerup', onGamePointerUp);
    gameContainer.addEventListener('pointermove', onGamePointerMove);
    
    console.log("Input handlers set up for mouse and tablet/touch support");
}
function onGamePointerDown(event) {
    if (!gameStarted || gameEnded) return;
    
    // Prevent default behavior - stops scrolling on touch devices
    event.preventDefault();
    
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    // Identify input type based on pointerType property
    // Standard values: mouse, pen, touch
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
        if (lastInputType !== 'tablet') {
            lastInputType = 'tablet';
            inputTypeChanged = true;
            console.log("Input type changed to tablet/touch:", event.pointerType);
        }
    } else {
        if (lastInputType !== 'mouse') {
            lastInputType = 'mouse';
            inputTypeChanged = true;
            console.log("Input type changed to mouse");
        }
    }
    
    // Log detailed input information
    console.log(`Input: ${lastInputType} at (${mouseX}, ${mouseY}), pointerType: ${event.pointerType}`);
    
    // Get appropriate click radius based on current input type
    let clickRadius = getClickRadius(lastInputType, difficulty);
    
    // Sort circles by creation time to ensure we hit the oldest first
    circles.sort((a, b) => a.createdAt - b.createdAt);
    
    // Check circles first
    let foundValidCircle = false;
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        if (circle.clicked || circle.missed) continue;
        
        const dx = mouseX - circle.x;
        const dy = mouseY - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Debug logging
        console.log(`Circle #${circle.number} check: distance=${distance.toFixed(2)}, threshold=${(circle.size * clickRadius).toFixed(2)}`);
        
        if (distance <= circle.size * clickRadius) {
            console.log(`✓ Hit circle #${circle.number}`);
            hitCircle(circle, distance);
            foundValidCircle = true;
            break;
        }
    }
    
    // Only check sliders if no circle was hit
    if (!foundValidCircle) {
        // Sort sliders by creation time
        sliders.sort((a, b) => a.createdAt - b.createdAt);
        
        for (let i = 0; i < sliders.length; i++) {
            const slider = sliders[i];
            if (slider.completed || slider.missed || slider.active) continue;
            
            const dx = mouseX - slider.startX;
            const dy = mouseY - slider.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Debug logging
            console.log(`Slider #${slider.number} check: distance=${distance.toFixed(2)}, threshold=${(slider.size * clickRadius).toFixed(2)}`);
            
            if (distance <= slider.size * clickRadius) {
                console.log(`✓ Hit slider #${slider.number}`);
                startSlider(slider, distance);
                break;
            }
        }
    }
}
function onGamePointerUp(event) {
    if (!gameStarted || gameEnded) return;
    
    mouseDown = false;
    
    // If we have an active slider, check if it should be released
    if (currentSlider && currentSlider.active) {
        console.log(`Releasing slider #${currentSlider.number}`);
        releaseSlider(currentSlider);
    }
}


function onGamePointerMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    // Update slider tracking if we're holding down on an active slider
    if (mouseDown && currentSlider && currentSlider.active) {
        updateSliderWithCursor(currentSlider);
        updateSliderTracking(currentSlider);
    }
}
function getTimingWindows(inputType, difficultyLevel, approachRate) {
    const windows = {};
    
    if (inputType === 'keyboard') {
        // More forgiving timing windows for keyboard
        switch(difficultyLevel) {
            case 'easy':
                windows.perfect = approachRate * 0.35; // 35% of approach rate
                windows.good = approachRate * 0.55;    // 55% of approach rate
                windows.ok = approachRate * 0.75;      // 75% of approach rate
                break;
            case 'normal':
                windows.perfect = approachRate * 0.30; // 30% of approach rate
                windows.good = approachRate * 0.50;    // 50% of approach rate
                windows.ok = approachRate * 0.70;      // 70% of approach rate
                break;
            case 'hard':
                windows.perfect = approachRate * 0.25; // 25% of approach rate
                windows.good = approachRate * 0.40;    // 40% of approach rate
                windows.ok = approachRate * 0.55;      // 55% of approach rate
                break;
            default:
                windows.perfect = approachRate * 0.30;
                windows.good = approachRate * 0.50;
                windows.ok = approachRate * 0.70;
        }
    } else if (inputType === 'tablet') {
        // Tablet settings (unchanged)
        switch(difficultyLevel) {
            case 'easy':
                windows.perfect = approachRate * 0.30;
                windows.good = approachRate * 0.50;
                windows.ok = approachRate * 0.70;
                break;
            case 'normal':
                windows.perfect = approachRate * 0.25;
                windows.good = approachRate * 0.40;
                windows.ok = approachRate * 0.60;
                break;
            case 'hard':
                windows.perfect = approachRate * 0.18;
                windows.good = approachRate * 0.30;
                windows.ok = approachRate * 0.45;
                break;
            default:
                windows.perfect = approachRate * 0.25;
                windows.good = approachRate * 0.40;
                windows.ok = approachRate * 0.60;
        }
    } else {
        // Mouse settings (unchanged)
        switch(difficultyLevel) {
            case 'easy':
                windows.perfect = approachRate * 0.22;
                windows.good = approachRate * 0.40;
                windows.ok = approachRate * 0.60;
                break;
            case 'normal':
                windows.perfect = approachRate * 0.15;
                windows.good = approachRate * 0.30;
                windows.ok = approachRate * 0.50;
                break;
            case 'hard':
                windows.perfect = approachRate * 0.10;
                windows.good = approachRate * 0.20;
                windows.ok = approachRate * 0.35;
                break;
            default:
                windows.perfect = approachRate * 0.15;
                windows.good = approachRate * 0.30;
                windows.ok = approachRate * 0.50;
        }
    }
    
    // Debug log the timing windows
    console.log(`Timing windows for ${inputType} (${difficultyLevel}): Perfect=${windows.perfect.toFixed(0)}ms, Good=${windows.good.toFixed(0)}ms, OK=${windows.ok.toFixed(0)}ms`);
    
    return windows;
}

function addInputTypeDisplay() {
    const displayDiv = document.createElement('div');
    displayDiv.id = 'input-type-display';
    displayDiv.style.position = 'absolute';
    displayDiv.style.top = '140px';
    displayDiv.style.right = '20px';
    displayDiv.style.color = 'white';
    displayDiv.style.fontFamily = 'Arial';
    displayDiv.style.fontSize = '14px';
    displayDiv.style.zIndex = '100';
    displayDiv.textContent = 'Input: Mouse';
    
    gameContainer.appendChild(displayDiv);
    
    // Update the display periodically
    setInterval(() => {
        const display = document.getElementById('input-type-display');
        if (display) {
            display.textContent = `Input: ${lastInputType.charAt(0).toUpperCase() + lastInputType.slice(1)}`;
            
            if (inputTypeChanged) {
                display.style.color = 'yellow';
                setTimeout(() => { 
                    display.style.color = 'white';
                    inputTypeChanged = false;
                }, 1000);
            }
        }
    }, 200);
}
// Add this to your game to visualize the hit detection area
function addHitDetectionVisualizer() {
    // Create a debug toggle button
    const debugButton = document.createElement('button');
    debugButton.id = 'debug-toggle';
    debugButton.textContent = 'Show Hit Area';
    debugButton.style.position = 'absolute';
    debugButton.style.bottom = '10px';
    debugButton.style.right = '10px';
    debugButton.style.zIndex = '1000';
    debugButton.style.padding = '5px 10px';
    debugButton.style.backgroundColor = '#ff66aa';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '5px';
    debugButton.style.cursor = 'pointer';
    
    let debugMode = false;
    
    debugButton.addEventListener('click', () => {
        debugMode = !debugMode;
        debugButton.textContent = debugMode ? 'Hide Hit Area' : 'Show Hit Area';
        
        // Toggle visualization of hit areas
        document.querySelectorAll('.hit-area').forEach(el => {
            el.style.display = debugMode ? 'block' : 'none';
        });
        
        // If turning on debug mode, add visualizations to all current circles
        if (debugMode) {
            circles.forEach(circle => addHitAreaVisual(circle));
        }
    });
    
    gameContainer.appendChild(debugButton);
    
    // Create hit area visualization when creating a circle
    const originalCreateCircle = window.createCircle;
    window.createCircle = function() {
        const circle = originalCreateCircle.apply(this, arguments);
        if (debugMode) {
            setTimeout(() => {
                addHitAreaVisual(circle);
            }, 10);
        }
        return circle;
    };
    
    function addHitAreaVisual(circle) {
        // Get the appropriate click radius
        const clickRadius = getClickRadius(lastInputType, difficulty);
        
        // Create visual element for hit area
        const hitAreaElement = document.createElement('div');
        hitAreaElement.className = 'hit-area';
        hitAreaElement.id = `hit-area-${circle.id}`;
        hitAreaElement.style.position = 'absolute';
        hitAreaElement.style.width = `${circle.size * clickRadius * 2}px`;
        hitAreaElement.style.height = `${circle.size * clickRadius * 2}px`;
        hitAreaElement.style.left = `${circle.x}px`;
        hitAreaElement.style.top = `${circle.y}px`;
        hitAreaElement.style.border = '1px dashed rgba(255, 255, 255, 0.5)';
        hitAreaElement.style.borderRadius = '50%';
        hitAreaElement.style.transform = 'translate(-50%, -50%)';
        hitAreaElement.style.zIndex = '8';
        hitAreaElement.style.pointerEvents = 'none';
        hitAreaElement.style.display = debugMode ? 'block' : 'none';
        
        gameContainer.appendChild(hitAreaElement);
        
        // Remove when circle is removed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && 
                    Array.from(mutation.removedNodes).includes(circle.element)) {
                    if (hitAreaElement.parentNode) {
                        hitAreaElement.parentNode.removeChild(hitAreaElement);
                    }
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(gameContainer, { childList: true });
    }
}

// Call this function from your main initialization code
function initializeDebugTools() {
    // Only add in development mode (you can add your own check here)
    addHitDetectionVisualizer();
}

// Add this to the end of your startGame function
function startGameWithDebug() {
    startGame();
    // Initialize debug tools right after game starts
    initializeDebugTools();
}
function onGameTouchStart(event) {
    event.preventDefault(); // Prevent scrolling
    if (!gameStarted || gameEnded) return;
    
    const touch = event.touches[0];
    
    // Convert touch to pointer-like event
    const pointerEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pointerType: 'touch',
        pressure: 1.0
    };
    
    // Use the pointer handler
    lastInputType = 'tablet'; // Treat touch as tablet for hit detection
    inputTypeChanged = true;
    
    onGamePointerDown(pointerEvent);
}
function onGameTouchEnd(event) {
    event.preventDefault();
    onGamePointerUp({ pointerType: 'touch' });
}

function onGameTouchMove(event) {
    event.preventDefault();
    if (!gameStarted || gameEnded) return;
    
    const touch = event.touches[0];
    if (touch) {
        const pointerEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            pointerType: 'touch',
            pressure: 1.0
        };
        
        onGamePointerMove(pointerEvent);
    }
}
function detectTouchDevice() {
    // Check for presence of touchscreen capability
    const hasTouchScreen = (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
    );
    
    console.log("Touch device detected: " + hasTouchScreen);
    
    // Set default input type based on device
    if (hasTouchScreen) {
        lastInputType = 'tablet';
        console.log("Default input set to tablet due to touchscreen detection");
    } else {
        lastInputType = 'mouse';
        console.log("Default input set to mouse");
    }
}


function calculateFinalAccuracy() {
    if (totalHits === 0) return 100;
    
    // Use the same calculation as updateAccuracy
    const allHits = [];
    
    // Add each hit type to the array
    for (let i = 0; i < hits300; i++) allHits.push(100); // 100% for perfect hits
    for (let i = 0; i < hits100; i++) allHits.push(33.3); // 33.3% for 100 hits
    for (let i = 0; i < hits50; i++) allHits.push(16.7); // 16.7% for 50 hits
    for (let i = 0; i < hitsMiss; i++) allHits.push(0); // 0% for misses
    
    // Calculate average
    const sum = allHits.reduce((total, value) => total + value, 0);
    return sum / totalHits;
}
function setupKeyboardHandlers() {
    // Remove any existing keyboard handlers to prevent duplicates
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    
    // Add keyboard event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    console.log("Keyboard handlers set up for Z and X keys");
}
function onKeyDown(event) {
    if (!gameStarted || gameEnded) return;
    
    // Handle only Z and X keys (also support lowercase)
    if (event.key === 'z' || event.key === 'Z') {
        if (!keyZ) { // Only trigger once for initial press
            keyZ = true;
            // Change to keyboard mode if it's the first keyboard input
            if (!keyboardMode) {
                keyboardMode = true;
                lastInputType = 'keyboard';
                inputTypeChanged = true;
                console.log("Input mode changed to keyboard");
                
                // Update input display if it exists
                const display = document.getElementById('input-type-display');
                if (display) {
                    display.textContent = 'Input: Keyboard';
                    display.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
                    setTimeout(() => {
                        display.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    }, 1000);
                }
            }
            // Simulate a click at the current cursor position
            simulateClickAtCursor();
        }
    } else if (event.key === 'x' || event.key === 'X') {
        if (!keyX) { // Only trigger once for initial press
            keyX = true;
            // Change to keyboard mode if it's the first keyboard input
            if (!keyboardMode) {
                keyboardMode = true;
                lastInputType = 'keyboard';
                inputTypeChanged = true;
                console.log("Input mode changed to keyboard");
                
                // Update input display if it exists
                const display = document.getElementById('input-type-display');
                if (display) {
                    display.textContent = 'Input: Keyboard';
                    display.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
                    setTimeout(() => {
                        display.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    }, 1000);
                }
            }
            // Simulate a click at the current cursor position
            simulateClickAtCursor();
        }
    }
}

function onKeyUp(event) {
    if (event.key === 'z' || event.key === 'Z') {
        keyZ = false;
        
        // Only simulate mouse up if both keys are released and we have an active slider
        if (!keyX && currentSlider && currentSlider.active) {
            simulateMouseUp();
        }
    } else if (event.key === 'x' || event.key === 'X') {
        keyX = false;
        
        // Only simulate mouse up if both keys are released and we have an active slider
        if (!keyZ && currentSlider && currentSlider.active) {
            simulateMouseUp();
        }
    }
}
function simulateClickAtCursor() {
    // Ignore if game hasn't started or has ended
    if (!gameStarted || gameEnded) return;
    
    // Create a synthetic pointer event
    const clickEvent = {
        clientX: mouseX,
        clientY: mouseY,
        pointerType: 'keyboard', // Use 'keyboard' as pointer type for tracking
        preventDefault: function() {}
    };
    
    // Call the same function that handles pointer down events
    mouseDown = true;
    onGamePointerDown(clickEvent);
    
    console.log(`Keyboard click simulated at (${mouseX}, ${mouseY})`);
}
function simulateMouseUp() {
    // Create a synthetic pointer event
    const releaseEvent = {
        pointerType: 'keyboard',
        preventDefault: function() {}
    };
    
    // Call the same function that handles pointer up events
    mouseDown = false;
    onGamePointerUp(releaseEvent);
    
    console.log("Keyboard release simulated");
}
function getClickRadius(inputType, difficultyLevel) {
    if (inputType === 'keyboard') {
        // Very forgiving hit detection for keyboard
        switch(difficultyLevel) {
            case 'easy':
                return 3.5;  // Extremely forgiving for easy mode
            case 'normal':
                return 3.0;  // Very forgiving for normal mode
            case 'hard':
                return 2.5;  // Quite forgiving even for hard mode
            default:
                return 3.0;
        }
    } else if (inputType === 'tablet') {
        // Tablet settings (unchanged)
        switch(difficultyLevel) {
            case 'easy':
                return 3.0;
            case 'normal':
                return 2.5;
            case 'hard':
                return 2.0;
            default:
                return 2.5;
        }
    } else {
        // Mouse settings (unchanged)
        switch(difficultyLevel) {
            case 'easy':
                return 2.5;
            case 'normal':
                return 2.0;
            case 'hard':
                return 1.7;
            default:
                return 2.0;
        }
    }
}
function addInputOptionToMenu() {
    const menuDiv = document.getElementById('start-menu');
    if (!menuDiv) return;
    
    // Create input selector
    const inputSelector = document.createElement('div');
    inputSelector.className = 'input-selector';
    inputSelector.style.marginBottom = '20px';
    inputSelector.innerHTML = `
        <p>Select input type:</p>
        <div class="input-buttons">
            <button class="input-btn ${lastInputType === 'mouse' ? 'selected' : ''}" data-input="mouse">Mouse</button>
            <button class="input-btn ${lastInputType === 'tablet' ? 'selected' : ''}" data-input="tablet">Tablet/Touch</button>
            <button class="input-btn ${lastInputType === 'keyboard' ? 'selected' : ''}" data-input="keyboard">Keyboard (Z/X)</button>
        </div>
    `;
    
    // Insert after difficulty selector
    const difficultySelector = document.querySelector('.difficulty-selector');
    if (difficultySelector && difficultySelector.nextSibling) {
        menuDiv.insertBefore(inputSelector, difficultySelector.nextSibling);
    } else {
        menuDiv.appendChild(inputSelector);
    }
    
    // Add event listeners
    const inputButtons = document.querySelectorAll('.input-btn');
    inputButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update selected button
            document.querySelectorAll('.input-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Update input type
            lastInputType = this.dataset.input;
            if (lastInputType === 'keyboard') {
                keyboardMode = true;
            } else {
                keyboardMode = false;
            }
            console.log(`Input type set to ${lastInputType} from menu`);
        });
    });
    
    // Add CSS for the input buttons
    const style = document.createElement('style');
    style.textContent = `
        .input-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .input-btn {
            background-color: #444;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            font-size: 16px;
            cursor: pointer;
        }
        .input-btn.selected {
            background-color: #ff66aa;
        }
    `;
    document.head.appendChild(style);
}
function addKeyboardInstructions() {
    const startMenu = document.getElementById('start-menu');
    if (!startMenu) return;
    
    const instructionsP = startMenu.querySelector('p');
    if (instructionsP) {
        instructionsP.innerHTML = 'Click the circles to the beat!<br>Or use Z and X keys on your keyboard!';
    }
    
    // Add keyboard controls visual guide
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'keyboard-controls';
    controlsDiv.style.marginTop = '10px';
    controlsDiv.style.marginBottom = '15px';
    controlsDiv.innerHTML = `
        <div style="display: inline-block; margin: 0 10px;">
            <div style="background: #444; padding: 5px 15px; border-radius: 4px; display: inline-block; color: white; font-weight: bold;">Z</div>
            <span style="margin-left: 5px;">Hit</span>
        </div>
        <div style="display: inline-block; margin: 0 10px;">
            <div style="background: #444; padding: 5px 15px; border-radius: 4px; display: inline-block; color: white; font-weight: bold;">X</div>
            <span style="margin-left: 5px;">Hit</span>
        </div>
    `;
    
    // Insert after first paragraph
    if (instructionsP && instructionsP.nextSibling) {
        startMenu.insertBefore(controlsDiv, instructionsP.nextSibling);
    } else {
        startMenu.appendChild(controlsDiv);
    }
}
function addBrunoMarsMusic() {
    // Create audio element with your licensed track
    const music = new Audio('assets/locked-out-of-heaven.mp3'); // Adjust path as needed
    music.volume = 0.5; // Set to 50% volume initially
    
    // Set the tempo for your rhythm game (Locked Out of Heaven is ~144 BPM)
    const songBPM = 144;
    
    // Create music control UI
    const musicControls = document.createElement('div');
    musicControls.style.position = 'absolute';
    musicControls.style.top = '20px';
    musicControls.style.left = '20px';
    musicControls.style.zIndex = '100';
    
    // Play/pause button
    const playButton = document.createElement('button');
    playButton.innerHTML = '🔊';
    playButton.style.backgroundColor = '#ff66aa';
    playButton.style.border = 'none';
    playButton.style.borderRadius = '5px';
    playButton.style.padding = '5px 10px';
    playButton.style.color = 'white';
    playButton.style.marginRight = '5px';
    playButton.style.cursor = 'pointer';
    
    // Volume control
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = '50';
    volumeSlider.style.width = '80px';
    volumeSlider.style.verticalAlign = 'middle';
    
    // Add controls to the container
    musicControls.appendChild(playButton);
    musicControls.appendChild(volumeSlider);
    gameContainer.appendChild(musicControls);
    
    // Music state
    let musicPlaying = false;
    
    // Volume control event
    volumeSlider.addEventListener('input', () => {
        music.volume = volumeSlider.value / 100;
    });
    
    // Play/pause button event
    playButton.addEventListener('click', () => {
        if (musicPlaying) {
            music.pause();
            playButton.innerHTML = '🔈';
        } else {
            music.play();
            playButton.innerHTML = '🔊';
        }
        musicPlaying = !musicPlaying;
    });
    
    // Auto-start music when game starts
    const originalStartGame = startGame;
    window.startGame = function() {
        originalStartGame.call(this);
        
        // Restart music from beginning
        music.currentTime = 0;
        music.play();
        musicPlaying = true;
        playButton.innerHTML = '🔊';
        
        // For a 144 BPM song, each beat is approximately 417ms
        const beatInterval = 60000 / songBPM;
        
        // Update your difficulty settings based on this
        difficultySettings.easy.spawnInterval = beatInterval * 2; // Every 2 beats for easy
        difficultySettings.normal.spawnInterval = beatInterval; // Every beat for normal
        difficultySettings.hard.spawnInterval = beatInterval / 2; // Twice per beat for hard
    };
    
    // Optional: Handle game ending
    const originalEndGame = endGame;
    window.endGame = function() {
        originalEndGame.call(this);
        
        // Optional: pause or fade out music when game ends
        // music.pause();
        // musicPlaying = false;
        // playButton.innerHTML = '🔈';
    };
}
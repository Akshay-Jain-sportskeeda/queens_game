class QueensPuzzle {
    constructor() {
        this.boardSize = 0;
        this.board = [];
        this.history = [];
        this.regions = [];
        this.solution = [];
        this.prefills = [];
        this.violations = new Set();
        this.validationTimeout = null;
        this.startTime = null;
        this.moveCount = 0;
        this.hintCount = 0;
        this.allPuzzleData = []; // Cache all puzzle data
        this.gameCompleted = false;
        this.loadPuzzleData();
    }

    async loadPuzzleData() {
        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7zVz3B8XRn-mIHVTBSLJ6JBp7liPx9micD9t3KOiMFAMpqqnJT1wpXbZl8KrZQ9WtGtMn0gM9Hvu9/pub?gid=0&single=true&output=csv');
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            
            // Find today's date
            // Store all puzzle data for archive
            this.allPuzzleData = [];
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            let todayRow = null;
            
            // Helper function to parse CSV line with quoted fields
            const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };
            
            // Parse header to find column indices
            const headers = parseCSVLine(lines[0]);
            const dateIndex = headers.indexOf('date');
            const gridSizeIndex = headers.indexOf('grid_size');
            const regionsIndex = headers.indexOf('regions');
            const queensIndex = headers.indexOf('queens');
            const prefillsIndex = headers.indexOf('prefills');
            
            // Find today's row
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                if (row[dateIndex] === today) {
                    todayRow = row;
                    break;
                }
            }
            
            // If no data for today, use the first available row
            if (!todayRow && lines.length > 1) {
                todayRow = parseCSVLine(lines[1]);
            }
            
            if (todayRow) {
                // Parse grid size
                this.boardSize = parseInt(todayRow[gridSizeIndex]);
                
                // Initialize board
                this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
                
                // Parse regions (assuming it's a JSON array of arrays)
                this.regions = JSON.parse(todayRow[regionsIndex].replace(/^"|"$/g, ''));
                
                // Parse solution (assuming it's a JSON array of arrays)
                // Parse solution as coordinate pairs [row, col]
                const solutionCoords = JSON.parse(todayRow[queensIndex].replace(/^"|"$/g, ''));
                
                // Convert coordinate pairs to 2D grid
                this.solution = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
                solutionCoords.forEach(([row, col]) => {
                    if (row < this.boardSize && col < this.boardSize) {
                        this.solution[row][col] = 1;
                    }
                });
                
                // Parse prefills (assuming it's a JSON array of arrays)
                this.prefills = JSON.parse(todayRow[prefillsIndex].replace(/^"|"$/g, ''));
                
                // Apply prefills to the board
                this.prefills.forEach(([row, col]) => {
                    if (row < this.boardSize && col < this.boardSize) {
                        this.board[row][col] = '🏈';
                    }
                });
            } else {
                // Fallback to default 8x8 puzzle if no data found
                this.boardSize = 8;
                this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
                this.regions = this.createDefaultRegions();
                this.solution = this.createDefaultSolution();
                this.prefills = [];
            }
            
            this.init();
        } catch (error) {
            console.error('Error loading puzzle data:', error);
            // Fallback to default puzzle
            this.boardSize = 8;
            this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
            this.regions = this.createDefaultRegions();
            this.solution = this.createDefaultSolution();
            this.prefills = [];
            this.init();
        }
    }

    createDefaultRegions() {
        // Default 8x8 regions as fallback
        return [
            [0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,0,0],
            [0,2,3,3,3,1,0,0],
            [0,4,3,3,3,5,5,0],
            [0,4,3,3,3,5,5,0],
            [0,0,6,6,6,0,5,0],
            [7,0,0,6,0,0,0,0],
            [7,0,0,6,0,0,0,0]
        ];
    }

    createDefaultSolution() {
        // Default solution as fallback
        return [
            [0,0,0,0,0,0,0,1],
            [0,1,0,0,0,0,0,0],
            [0,0,0,0,0,1,0,0],
            [0,0,0,0,0,0,1,0],
            [0,0,1,0,0,0,0,0],
            [1,0,0,0,0,0,0,0],
            [0,0,0,1,0,0,0,0],
            [0,0,0,0,1,0,0,0]
        ];
    }

    getRegionMap() {
        const regionMap = {};
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                regionMap[`${row},${col}`] = this.regions[row][col];
            }
        }
        return regionMap;
    }

    init() {
        this.createBoard();
        this.bindEvents();
        this.startTime = Date.now();
        this.moveCount = 0;
        this.hintCount = 0;
        this.gameCompleted = false;
    }

    createBoard() {
        this.bindEvents();
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        
        const regionMap = this.getRegionMap();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const regionIndex = regionMap[`${row},${col}`];
                cell.classList.add(`region-${regionIndex}`);
                
                // Add region borders
                const currentRegion = this.regions[row][col];
                
                // Check top border
                if (row === 0 || this.regions[row - 1][col] !== currentRegion) {
                    cell.classList.add('border-top');
                }
                
                // Check right border
                if (col === this.boardSize - 1 || this.regions[row][col + 1] !== currentRegion) {
                    cell.classList.add('border-right');
                }
                
                // Check bottom border
                if (row === this.boardSize - 1 || this.regions[row + 1][col] !== currentRegion) {
                    cell.classList.add('border-bottom');
                }
                
                // Check left border
                if (col === 0 || this.regions[row][col - 1] !== currentRegion) {
                    cell.classList.add('border-left');
                }
                
                // Add prefilled queens
                if (this.board[row][col] === '🏈') {
                    cell.textContent = '🏈';
                    cell.classList.add('prefilled');
                }
                
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                gameBoard.appendChild(cell);
            }
        }
    }

    bindEvents() {
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        const undoBtn = document.getElementById('undoBtn');
        const hintBtn = document.getElementById('hintBtn');
        const resetBtn = document.getElementById('resetBtn');
        const shareBtn = document.getElementById('shareBtn');
        const archiveBtn = document.getElementById('archiveBtn');
        const archiveCloseBtn = document.getElementById('archiveCloseBtn');
        
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (hintBtn) hintBtn.addEventListener('click', () => this.getHint());
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        if (shareBtn) shareBtn.addEventListener('click', () => this.shareResults());
        if (archiveBtn) archiveBtn.addEventListener('click', () => this.showArchive());
        if (archiveCloseBtn) archiveCloseBtn.addEventListener('click', () => this.hideArchive());
    }

    handleCellClick(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        // Don't allow changes to prefilled cells
        if (e.target.classList.contains('prefilled')) {
            return;
        }
        
        // Don't allow moves after game is completed
        if (this.gameCompleted) {
            return;
        }
        
        // Clear any existing hints when user makes a move
        this.clearHintHighlights();
        this.resetInfoMessage();
        
        // Save current state for undo
        this.saveState();
        this.moveCount++;
        
        const currentValue = this.board[row][col];
        let newValue = '';
        
        if (currentValue === '') {
            newValue = 'X';
        } else if (currentValue === 'X') {
            newValue = '🏈';
        } else {
            newValue = '';
        }
        
        this.board[row][col] = newValue;
        this.updateDisplayBasic();
        this.debouncedValidation();
        this.checkWin();
    }

    isValidFootballPlacement(row, col) {
        // Check if placing a football at (row, col) is valid
        
        // Check row
        for (let c = 0; c < this.boardSize; c++) {
            if (c !== col && this.board[row][c] === '🏈') {
                return false;
            }
        }
        
        // Check column
        for (let r = 0; r < this.boardSize; r++) {
            if (r !== row && this.board[r][col] === '🏈') {
                return false;
            }
        }
        
        // Check diagonals and adjacent cells (footballs cannot touch)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < this.boardSize && newCol >= 0 && newCol < this.boardSize) {
                    if (this.board[newRow][newCol] === '🏈') {
                        return false;
                    }
                }
            }
        }
        
        // Check color region
        const currentRegion = this.regions[row][col];
        
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (r === row && c === col) continue;
                if (this.regions[r][c] === currentRegion && this.board[r][c] === '🏈') {
                    return false;
                }
            }
        }
        
        return true;
    }

    debouncedValidation() {
        // Clear existing timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        
        // Update display immediately (without conflicts)
        this.updateDisplayBasic();
        
        // Debounce the validation
        this.validationTimeout = setTimeout(() => {
            this.validateAndHighlight();
        }, 300); // 300ms debounce delay
    }

    updateDisplayBasic() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.board[row][col];
            cell.textContent = value;
            
            // Clear ALL previous conflict styling immediately
            cell.classList.remove('conflict', 'conflict-row', 'conflict-column', 'conflict-region', 'conflict-adjacent');
            cell.classList.remove('border-conflict-top', 'border-conflict-right', 'border-conflict-bottom', 'border-conflict-left');
            
            // Add data attribute for styling X marks
            if (value === 'X') {
                cell.setAttribute('data-symbol', 'X');
                cell.style.color = '#888';
            } else {
                cell.removeAttribute('data-symbol');
                cell.style.color = '';
            }
        });
    }

    validateAndHighlight() {
        // Clear previous violations
        this.violations.clear();
        this.conflictTypes = new Map(); // Track conflict types for each cell
        
        // Find all footballs on the board
        const footballs = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === '🏈') {
                    footballs.push([row, col]);
                }
            }
        }

        // Check each football against every other football for conflicts
        let hasConflicts = false;
        let conflictMessages = [];
        
        for (let i = 0; i < footballs.length; i++) {
            const [row1, col1] = footballs[i];
            
            for (let j = i + 1; j < footballs.length; j++) {
                const [row2, col2] = footballs[j];
                
                let conflictType = '';
                
                // Check if they're in the same row
                if (row1 === row2) {
                    hasConflicts = true;
                    conflictType = 'same row';
                    conflictMessages.push(`Two footballs in row ${row1 + 1}`);
                    this.addRowConflict(row1);
                }
                
                // Check if they're in the same column
                if (col1 === col2) {
                    hasConflicts = true;
                    conflictType = 'same column';
                    conflictMessages.push(`Two footballs in column ${col1 + 1}`);
                    this.addColumnConflict(col1);
                }
                
                // Check if they're in the same region
                if (this.regions[row1][col1] === this.regions[row2][col2]) {
                    hasConflicts = true;
                    conflictType = 'same region';
                    conflictMessages.push(`Two footballs in same region`);
                    this.addRegionConflict(this.regions[row1][col1]);
                }
                
                // Check if they're adjacent (touching)
                const rowDiff = Math.abs(row1 - row2);
                const colDiff = Math.abs(col1 - col2);
                if (rowDiff <= 1 && colDiff <= 1) {
                    hasConflicts = true;
                    conflictType = 'adjacent';
                    conflictMessages.push(`Footballs cannot touch each other`);
                    this.addAdjacentConflict(row1, col1);
                    this.addAdjacentConflict(row2, col2);
                }
            }
        }
        
        // Apply violation highlighting
        this.applyViolationHighlighting();
        
        // Show conflict message if there are conflicts
        if (hasConflicts && conflictMessages.length > 0) {
            // Show the first unique conflict message
            const uniqueMessages = [...new Set(conflictMessages)];
            this.showInfoMessage(uniqueMessages[0], 'conflict');
        }
    }

    addRowConflict(row) {
        for (let col = 0; col < this.boardSize; col++) {
            const key = `${row},${col}`;
            this.violations.add(key);
            this.conflictTypes.set(key, 'row');
        }
    }

    addColumnConflict(col) {
        for (let row = 0; row < this.boardSize; row++) {
            const key = `${row},${col}`;
            this.violations.add(key);
            this.conflictTypes.set(key, 'column');
        }
    }

    addRegionConflict(regionId) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.regions[row][col] === regionId) {
                    const key = `${row},${col}`;
                    this.violations.add(key);
                    this.conflictTypes.set(key, 'region');
                }
            }
        }
    }

    addAdjacentConflict(row, col) {
        const key = `${row},${col}`;
        this.violations.add(key);
        this.conflictTypes.set(key, 'adjacent');
    }

    applyViolationHighlighting() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellKey = `${row},${col}`;
            
            // Clear all conflict classes first
            cell.classList.remove('conflict', 'conflict-row', 'conflict-column', 'conflict-region', 'conflict-adjacent');
            
            if (this.violations.has(cellKey)) {
                const conflictType = this.conflictTypes.get(cellKey);
                cell.classList.add('conflict', `conflict-${conflictType}`);
                
                // Add edge-specific classes for border drawing
                this.addEdgeBorders(cell, row, col, conflictType);
            }
        });
    }

    addEdgeBorders(cell, row, col, conflictType) {
        switch (conflictType) {
            case 'row':
                // Add borders to top and bottom of the row
                if (row === 0 || !this.violations.has(`${row-1},${col}`)) {
                    cell.classList.add('border-conflict-top');
                }
                if (row === this.boardSize-1 || !this.violations.has(`${row+1},${col}`)) {
                    cell.classList.add('border-conflict-bottom');
                }
                break;
                
            case 'column':
                // Add borders to left and right of the column
                if (col === 0 || !this.violations.has(`${row},${col-1}`)) {
                    cell.classList.add('border-conflict-left');
                }
                if (col === this.boardSize-1 || !this.violations.has(`${row},${col+1}`)) {
                    cell.classList.add('border-conflict-right');
                }
                break;
                
            case 'region':
                // Add borders around the region edges
                const currentRegion = this.regions[row][col];
                
                if (row === 0 || this.regions[row-1][col] !== currentRegion) {
                    cell.classList.add('border-conflict-top');
                }
                if (col === this.boardSize-1 || this.regions[row][col+1] !== currentRegion) {
                    cell.classList.add('border-conflict-right');
                }
                if (row === this.boardSize-1 || this.regions[row+1][col] !== currentRegion) {
                    cell.classList.add('border-conflict-bottom');
                }
                if (col === 0 || this.regions[row][col-1] !== currentRegion) {
                    cell.classList.add('border-conflict-left');
                }
                break;
                
            case 'adjacent':
                // Add border around individual adjacent cells
                cell.classList.add('border-conflict-top', 'border-conflict-right', 'border-conflict-bottom', 'border-conflict-left');
                break;
        }
    }

    checkWin() {
        // Check if we have exactly boardSize footballs
        let footballCount = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === '🏈') {
                    footballCount++;
                }
            }
        }
        
        if (footballCount !== this.boardSize) return false;
        
        // Check rows
        for (let row = 0; row < this.boardSize; row++) {
            let rowFootballs = 0;
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === '🏈') rowFootballs++;
            }
            if (rowFootballs !== 1) return false;
        }
        
        // Check columns
        for (let col = 0; col < this.boardSize; col++) {
            let colFootballs = 0;
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === '🏈') colFootballs++;
            }
            if (colFootballs !== 1) return false;
        }
        
        // Check regions
        const regionMap = this.getRegionMap();
        const regionFootballs = {};
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === '🏈') {
                    const region = regionMap[`${row},${col}`];
                    regionFootballs[region] = (regionFootballs[region] || 0) + 1;
                }
            }
        }
        
        // Check if each region has exactly one football
        const uniqueRegions = new Set(Object.values(regionMap));
        for (let region of uniqueRegions) {
            if (regionFootballs[region] !== 1) return false;
        }
        
        // All checks passed - player wins!
        this.showInfoMessage('Congratulations! You solved the puzzle!', 'success');
        
        // Mark game as completed
        this.gameCompleted = true;
        
        // Add win animation
        this.playWinAnimation();
        
        // Also show the win message div
        document.getElementById('winMessage').classList.remove('hidden');
        
        // Show win screen after animation completes
        setTimeout(() => {
            this.showWinScreen();
        }, 3000); // Wait for animation to complete
        
        return true;
    }

    playWinAnimation() {
        const cells = document.querySelectorAll('.cell');
        
        // Add staggered flip animation to all cells
        cells.forEach((cell, index) => {
            setTimeout(() => {
                // Clear the cell content during flip
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                // At 50% of animation (when flipped), change content
                setTimeout(() => {
                    // Create simple football field lines
                    const isMiddleRow = row === Math.floor(this.boardSize / 2) || row === Math.floor(this.boardSize / 2) - 1;
                    const isMiddleCol = col === Math.floor(this.boardSize / 2) || col === Math.floor(this.boardSize / 2) - 1;
                    const isEdgeRow = row === 0 || row === this.boardSize - 1;
                    const isEdgeCol = col === 0 || col === this.boardSize - 1;
                    
                    if (isMiddleRow && isMiddleCol) {
                        cell.textContent = '🏈'; // Center football
                    } else if (isMiddleRow || isMiddleCol) {
                        cell.textContent = '│'; // Field lines
                    } else if (isEdgeRow || isEdgeCol) {
                        cell.textContent = '─'; // Border lines
                    } else {
                        cell.textContent = ''; // Empty field
                    }
                }, 400); // Half of animation duration
                
                cell.classList.add('win-flip');
            }, index * 50); // 50ms delay between each cell
        });
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            cells.forEach(cell => {
                cell.classList.remove('win-flip');
            });
        }, cells.length * 50 + 1000); // Wait for all animations + 1 second
    }

    saveState() {
        this.history.push(this.board.map(row => [...row]));
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length > 0) {
            this.board = this.history.pop();
            this.debouncedValidation();
            document.getElementById('winMessage').classList.add('hidden');
        }
    }

    showHint() {
        // Progressive hint system
        
        // Don't allow hints after game is completed
        if (this.gameCompleted) {
            return;
        }
        
        this.hintCount++;
        
        // Step 1: Check for wrongly placed footballs FIRST
        const wrongFootball = this.getWrongFootballHint();
        if (wrongFootball) {
            this.showWrongFootballHint(wrongFootball);
            return;
        }
        
        // Step 2: Check for regions with footballs that need X marks
        const regionHint = this.getRegionXHint();
        if (regionHint) {
            this.showRegionXHint(regionHint);
            return;
        }
        
        // Step 3: Check for rows with footballs that need X marks
        const rowHint = this.getRowXHint();
        if (rowHint) {
            this.showRowXHint(rowHint);
            return;
        }
        
        // Step 4: Check for columns with footballs that need X marks
        const columnHint = this.getColumnXHint();
        if (columnHint) {
            this.showColumnXHint(columnHint);
            return;
        }
        
        // Step 5: Check for cells adjacent to footballs that need X marks
        const adjacentHint = this.getAdjacentXHint();
        if (adjacentHint) {
            this.showAdjacentXHint(adjacentHint);
            return;
        }
        
        // Step 6: Place a valid football as hint
        const validPlacement = this.getValidFootballHint();
        if (validPlacement) {
            this.showValidFootballHint(validPlacement);
            return;
        }
        
        // No hints available
        this.showInfoMessage('Great job! No obvious hints available', 'success');
    }
    
    getRegionXHint() {
        // Find regions that already have a football and have empty cells that should be marked with X
        for (let targetRegion = 0; targetRegion < 8; targetRegion++) {
            let hasFootball = false;
            let emptyCells = [];
            
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (this.regions[row][col] === targetRegion) {
                        if (this.board[row][col] === '🏈') {
                            hasFootball = true;
                        } else if (this.board[row][col] === '') {
                            emptyCells.push([row, col]);
                        }
                    }
                }
            }
            
            if (hasFootball && emptyCells.length > 0) {
                return { region: targetRegion, emptyCells };
            }
        }
        return null;
    }
    
    getRowXHint() {
        // Find rows that already have a football and have empty cells that should be marked with X
        for (let targetRow = 0; targetRow < this.boardSize; targetRow++) {
            let hasFootball = false;
            let emptyCells = [];
            
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[targetRow][col] === '🏈') {
                    hasFootball = true;
                } else if (this.board[targetRow][col] === '') {
                    emptyCells.push([targetRow, col]);
                }
            }
            
            if (hasFootball && emptyCells.length > 0) {
                return { row: targetRow, emptyCells };
            }
        }
        return null;
    }
    
    getColumnXHint() {
        // Find columns that already have a football and have empty cells that should be marked with X
        for (let targetCol = 0; targetCol < this.boardSize; targetCol++) {
            let hasFootball = false;
            let emptyCells = [];
            
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][targetCol] === '🏈') {
                    hasFootball = true;
                } else if (this.board[row][targetCol] === '') {
                    emptyCells.push([row, targetCol]);
                }
            }
            
            if (hasFootball && emptyCells.length > 0) {
                return { column: targetCol, emptyCells };
            }
        }
        return null;
    }
    
    getAdjacentXHint() {
        // Find empty cells that are adjacent to existing footballs and should be marked with X
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === '🏈') {
                    // Check all 8 adjacent cells for this football
                    const adjacentCells = [];
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue; // Skip the football cell itself
                            
                            const newRow = row + dr;
                            const newCol = col + dc;
                            
                            if (newRow >= 0 && newRow < this.boardSize && 
                                newCol >= 0 && newCol < this.boardSize &&
                                this.board[newRow][newCol] === '') {
                                adjacentCells.push([newRow, newCol]);
                            }
                        }
                    }
                    
                    // If this football has empty adjacent cells, return it as a hint
                    if (adjacentCells.length > 0) {
                        return { footballRow: row, footballCol: col, adjacentCells };
                    }
                }
            }
        }
        
        return null;
    }
    
    getWrongFootballHint() {
        // Find footballs that are in invalid positions
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === '🏈') {
                    // Check if this football is NOT in the correct solution position
                    if (this.solution[row][col] !== 1) {
                        return { row, col };
                    }
                }
            }
        }
        return null;
    }
    
    getValidFootballHint() {
        // Find a cell from the correct solution where a football should be placed
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Only suggest cells that are empty AND part of the correct solution
                const isEmpty = this.board[row][col] === '';
                const isInSolution = this.solution[row][col] === 1;
                
                if (isEmpty && isInSolution) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    showRegionXHint(hint) {
        // Highlight the region border
        this.highlightRegionBorder(hint.region, '#616161', 3);
        
        // Show message in info bar
        this.showInfoMessage(`Mark the highlighted cells with X`, 'hint');
    }
    
    showRowXHint(hint) {
        // Highlight the row border
        this.highlightRowBorder(hint.row, '#616161', 3);
        
        // Show message in info bar
        this.showInfoMessage(`Mark the highlighted cells with X`, 'hint');
    }
    
    showColumnXHint(hint) {
        // Highlight the column border
        this.highlightColumnBorder(hint.column, '#616161', 3);
        
        // Show message in info bar
        this.showInfoMessage(`Mark the highlighted cells with X`, 'hint');
    }
    
    showAdjacentXHint(hint) {
        // Highlight only the edge borders of the 3x3 grid around the specific football
        const minRow = Math.max(0, hint.footballRow - 1);
        const maxRow = Math.min(this.boardSize - 1, hint.footballRow + 1);
        const minCol = Math.max(0, hint.footballCol - 1);
        const maxCol = Math.min(this.boardSize - 1, hint.footballCol + 1);
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const newRow = hint.footballRow + dr;
                const newCol = hint.footballCol + dc;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize) {
                    const cell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
                    cell.classList.add('hint-highlight');
                    
                    // Add edge borders only
                    if (newRow === minRow) {
                        cell.style.borderTop = '3px solid #616161';
                    }
                    if (newRow === maxRow) {
                        cell.style.borderBottom = '3px solid #616161';
                    }
                    if (newCol === minCol) {
                        cell.style.borderLeft = '3px solid #616161';
                    }
                    if (newCol === maxCol) {
                        cell.style.borderRight = '3px solid #616161';
                    }
                }
            }
        }
        
        // Show message in info bar
        this.showInfoMessage(`Mark the highlighted cells with X`, 'conflict');
    }
    
    showWrongFootballHint(hint) {
        // Highlight the wrong football cell
        const cell = document.querySelector(`[data-row="${hint.row}"][data-col="${hint.col}"]`);
        cell.style.border = '3px solid #f44336';
        cell.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.5)';
        cell.classList.add('hint-highlight');
        
        // Show message in info bar
        this.showInfoMessage(`This football is in the wrong position`, 'conflict');
    }
    
    showValidFootballHint(hint) {
        // Highlight the valid placement cell
        const cell = document.querySelector(`[data-row="${hint.row}"][data-col="${hint.col}"]`);
        cell.style.border = '3px solid #4caf50';
        cell.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        cell.style.transform = 'scale(1.1)';
        cell.classList.add('hint-highlight');
        
        // Show message in info bar
        this.showInfoMessage(`Try placing a football here - this looks valid`, 'hint');
    }
    
    highlightRegionBorder(regionId, color, width) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.regions[row][col] === regionId) {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('hint-highlight');
                    
                    // Add borders on region edges
                    if (row === 0 || this.regions[row - 1][col] !== regionId) {
                        cell.style.borderTop = `${width}px solid ${color}`;
                    }
                    if (col === this.boardSize - 1 || this.regions[row][col + 1] !== regionId) {
                        cell.style.borderRight = `${width}px solid ${color}`;
                    }
                    if (row === this.boardSize - 1 || this.regions[row + 1][col] !== regionId) {
                        cell.style.borderBottom = `${width}px solid ${color}`;
                    }
                    if (col === 0 || this.regions[row][col - 1] !== regionId) {
                        cell.style.borderLeft = `${width}px solid ${color}`;
                    }
                }
            }
        }
    }
    
    highlightRowBorder(rowIndex, color, width) {
        for (let col = 0; col < this.boardSize; col++) {
            const cell = document.querySelector(`[data-row="${rowIndex}"][data-col="${col}"]`);
            cell.classList.add('hint-highlight');
            cell.style.borderTop = `${width}px solid ${color}`;
            cell.style.borderBottom = `${width}px solid ${color}`;
        }
    }
    
    highlightColumnBorder(colIndex, color, width) {
        for (let row = 0; row < this.boardSize; row++) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${colIndex}"]`);
            cell.classList.add('hint-highlight');
            cell.style.borderLeft = `${width}px solid ${color}`;
            cell.style.borderRight = `${width}px solid ${color}`;
        }
    }
    
    showInfoMessage(message, type = 'default') {
        const infoBar = document.getElementById('infoBar');
        const infoText = infoBar.querySelector('.info-text');
        const infoIcon = infoBar.querySelector('.info-icon');
        
        // Clear previous classes
        infoBar.classList.remove('hint', 'conflict', 'success');
        
        // Set message and type
        infoText.textContent = message;
        
        // Add appropriate class and icon
        if (type === 'hint') {
            infoBar.classList.add('hint');
            infoIcon.textContent = '💡';
        } else if (type === 'conflict') {
            infoBar.classList.add('conflict');
            infoIcon.textContent = '⚠️';
        } else if (type === 'success') {
            infoBar.classList.add('success');
            infoIcon.textContent = '🎉';
        } else {
            infoIcon.textContent = '💡';
        }
        
        // Reset to default after 4 seconds
        // Don't auto-reset - wait for user input
    }
    
    resetInfoMessage() {
        const infoBar = document.getElementById('infoBar');
        const infoText = infoBar.querySelector('.info-text');
        const infoIcon = infoBar.querySelector('.info-icon');
        
        infoBar.classList.remove('hint', 'conflict', 'success');
        infoIcon.textContent = '💡';
        infoText.textContent = 'Use hints if you get stuck!';
    }
    
    clearHintHighlights() {
        const highlightedCells = document.querySelectorAll('.hint-highlight');
        highlightedCells.forEach(cell => {
            cell.classList.remove('hint-highlight');
            cell.style.border = '';
            cell.style.borderTop = '';
            cell.style.borderRight = '';
            cell.style.borderBottom = '';
            cell.style.borderLeft = '';
            cell.style.boxShadow = '';
            cell.style.transform = '';
        });
    }

    showWinScreen() {
        const winScreen = document.getElementById('winScreen');
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - this.startTime) / 1000);
        
        // Format time as MM:SS
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update stats
        document.getElementById('timeValue').textContent = timeString;
        document.getElementById('movesValue').textContent = this.moveCount;
        document.getElementById('hintsValue').textContent = this.hintCount;
        
        // Show win screen
        winScreen.classList.add('show');
    }
    
    shareResults() {
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - this.startTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const shareText = `🏈 NFL Field Puzzle Complete! 🎉\n⏱️ Time: ${timeString}\n🎯 Moves: ${this.moveCount}\n💡 Hints: ${this.hintCount}\n\nPlay at: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'NFL Field Puzzle',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Results copied to clipboard!');
            }).catch(() => {
                // Final fallback: show text in alert
                alert(shareText);
            });
        }
    }
    
    async showArchive() {
        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7zVz3B8XRn-mIHVTBSLJ6JBp7liPx9micD9t3KOiMFAMpqqnJT1wpXbZl8KrZQ9WtGtMn0gM9Hvu9/pub?gid=0&single=true&output=csv');
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            
            // Helper function to parse CSV line with quoted fields
            const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };
            
            // Parse header to find column indices
            const headers = parseCSVLine(lines[0]);
            const dateIndex = headers.indexOf('date');
            
            // Get all available dates
            const availableDates = [];
            const today = new Date().toISOString().split('T')[0];
            
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                if (row[dateIndex] && row[dateIndex] !== '') {
                    availableDates.push(row[dateIndex]);
                }
            }
            
            // Sort dates in descending order (newest first)
            availableDates.sort((a, b) => new Date(b) - new Date(a));
            
            // Populate the archive dates
            const archiveDates = document.getElementById('archiveDates');
            archiveDates.innerHTML = '';
            
            availableDates.forEach(date => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                if (date === today) {
                    dateItem.classList.add('today');
                }
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                dateItem.innerHTML = `
                    <div class="date-text">${formattedDate}</div>
                `;
                
                dateItem.addEventListener('click', () => this.loadPuzzleForDate(date));
                archiveDates.appendChild(dateItem);
            });
            
            // Show archive screen
            document.getElementById('archiveScreen').classList.add('show');
            
        } catch (error) {
            console.error('Error loading archive:', error);
            alert('Unable to load puzzle archive. Please try again later.');
        }
    }
    
    hideArchive() {
        document.getElementById('archiveScreen').classList.remove('show');
    }
    
    async loadPuzzleForDate(selectedDate) {
        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7zVz3B8XRn-mIHVTBSLJ6JBp7liPx9micD9t3KOiMFAMpqqnJT1wpXbZl8KrZQ9WtGtMn0gM9Hvu9/pub?gid=0&single=true&output=csv');
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            
            // Helper function to parse CSV line with quoted fields
            const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };
            
            // Parse header to find column indices
            const headers = parseCSVLine(lines[0]);
            const dateIndex = headers.indexOf('date');
            const gridSizeIndex = headers.indexOf('grid_size');
            const regionsIndex = headers.indexOf('regions');
            const queensIndex = headers.indexOf('queens');
            const prefillsIndex = headers.indexOf('prefills');
            
            // Find the selected date's row
            let selectedRow = null;
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                if (row[dateIndex] === selectedDate) {
                    selectedRow = row;
                    break;
                }
            }
            
            if (selectedRow) {
                // Parse and load the puzzle data
                this.boardSize = parseInt(selectedRow[gridSizeIndex]);
                this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
                this.regions = JSON.parse(selectedRow[regionsIndex].replace(/^"|"$/g, ''));
                
                // Parse solution as coordinate pairs [row, col]
                const solutionCoords = JSON.parse(selectedRow[queensIndex].replace(/^"|"$/g, ''));
                
                // Convert coordinate pairs to 2D grid
                this.solution = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
                solutionCoords.forEach(([row, col]) => {
                    if (row < this.boardSize && col < this.boardSize) {
                        this.solution[row][col] = 1;
                    }
                });
                
                // Parse prefills
                this.prefills = JSON.parse(selectedRow[prefillsIndex].replace(/^"|"$/g, ''));
                
                // Apply prefills to the board
                this.prefills.forEach(([row, col]) => {
                    if (row < this.boardSize && col < this.boardSize) {
                        this.board[row][col] = '🏈';
                    }
                });
                
                // Reset game state
                this.startTime = Date.now();
                this.history = [];
                this.violations = new Set();
                this.moveCount = 0;
                this.hintCount = 0;
                this.gameCompleted = false;
                
                // Hide screens and recreate board
                this.hideArchive();
                document.getElementById('winScreen').classList.remove('show');
                document.getElementById('winMessage').classList.add('hidden');
                
                // Recreate the board with new puzzle
                this.createBoard();
                this.debouncedValidation();
                
            } else {
                alert('Puzzle data not found for the selected date.');
            }
            
        } catch (error) {
            console.error('Error loading puzzle for date:', error);
            alert('Unable to load puzzle for the selected date. Please try again.');
        }
    }
    
    startNewGame() {
        // Hide win screen
        document.getElementById('winScreen').classList.remove('show');
        
        // Reset the game
        this.reset();
    }
    
    reset() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
        this.history = [];
        this.startTime = Date.now();
        this.moveCount = 0;
        this.hintCount = 0;
        this.gameCompleted = false;
        
        // Apply prefills to the board
        this.prefills.forEach(([row, col]) => {
            if (row < this.boardSize && col < this.boardSize) {
                this.board[row][col] = '🏈';
            }
        });
        
        this.debouncedValidation();
        document.getElementById('winMessage').classList.add('hidden');
        document.getElementById('winScreen').classList.remove('show');
    }

    getHint() {
        // Progressive hint system
        
        // Don't allow hints after game is completed
        if (this.gameCompleted) {
            return;
        }
        
        this.hintCount++;
        
        // Step 1: Check for wrongly placed footballs FIRST
        const wrongFootball = this.getWrongFootballHint();
        if (wrongFootball) {
            this.showWrongFootballHint(wrongFootball);
            return;
        }
        
        // Step 2: Check for regions with footballs that need X marks
        const regionHint = this.getRegionXHint();
        if (regionHint) {
            this.showRegionXHint(regionHint);
            return;
        }
        
        // Step 3: Check for rows with footballs that need X marks
        const rowHint = this.getRowXHint();
        if (rowHint) {
            this.showRowXHint(rowHint);
            return;
        }
        
        // Step 4: Check for columns with footballs that need X marks
        const columnHint = this.getColumnXHint();
        if (columnHint) {
            this.showColumnXHint(columnHint);
            return;
        }
        
        // Step 5: Check for cells adjacent to footballs that need X marks
        const adjacentHint = this.getAdjacentXHint();
        if (adjacentHint) {
            this.showAdjacentXHint(adjacentHint);
            return;
        }
        
        // Step 6: Place a valid football as hint
        const validPlacement = this.getValidFootballHint();
        if (validPlacement) {
            this.showValidFootballHint(validPlacement);
            return;
        }
        
        // No hints available
        this.showInfoMessage('Great job! No obvious hints available', 'success');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QueensPuzzle();
});
/**
 * Tic-Tac-Toe Game with Computer AI
 * Implements issues #1 and #2: Basic UI and Game Logic
 */

class TicTacToeGame {
    constructor() {
        // Game state
        this.board = Array(9).fill('');
        this.currentPlayer = 'X'; // X = Human, O = Computer
        this.gameActive = true;
        this.scores = {
            player: 0,
            computer: 0,
            ties: 0
        };

        // Winning combinations (rows, columns, diagonals)
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        // DOM elements
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerElement = document.getElementById('current-player');
        this.gameMessageElement = document.getElementById('game-message');
        this.resetButton = document.getElementById('reset-btn');
        this.playerScoreElement = document.getElementById('player-score');
        this.computerScoreElement = document.getElementById('computer-score');
        this.tieScoreElement = document.getElementById('tie-score');
        this.gameBoard = document.getElementById('game-board');

        this.initializeGame();
    }

    initializeGame() {
        // Add event listeners
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());

        // Load scores from localStorage
        this.loadScores();
        this.updateScoreDisplay();
        this.updateGameStatus();
    }

    handleCellClick(index) {
        // Check if cell is empty, game is active, and it's player's turn
        if (this.board[index] !== '' || !this.gameActive || this.currentPlayer !== 'X') {
            return;
        }

        // Make player move
        this.makeMove(index, 'X');

        // Check game state after player move
        if (this.checkGameEnd()) {
            return;
        }

        // Switch to computer turn
        this.currentPlayer = 'O';
        this.updateGameStatus();
        this.gameBoard.classList.add('computer-thinking');

        // Computer makes move after delay for better UX
        setTimeout(() => {
            this.makeComputerMove();
            this.gameBoard.classList.remove('computer-thinking');
        }, 600);
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.cells[index];
        
        // Update UI
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.classList.add('disabled');

        // Add animation
        cell.style.animation = 'none';
        cell.offsetHeight; // Trigger reflow
        cell.style.animation = 'celebrate 0.3s ease-in-out';
    }

    makeComputerMove() {
        if (!this.gameActive) return;

        const bestMove = this.getBestMove();
        if (bestMove !== -1) {
            this.makeMove(bestMove, 'O');
            
            if (!this.checkGameEnd()) {
                this.currentPlayer = 'X';
                this.updateGameStatus();
            }
        }
    }

    getBestMove() {
        // 1. Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner() === 'O') {
                    this.board[i] = ''; // Reset
                    return i;
                }
                this.board[i] = ''; // Reset
            }
        }

        // 2. Block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner() === 'X') {
                    this.board[i] = ''; // Reset
                    return i;
                }
                this.board[i] = ''; // Reset
            }
        }

        // 3. Take center if available
        if (this.board[4] === '') {
            return 4;
        }

        // 4. Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // 5. Take any available side
        const sides = [1, 3, 5, 7];
        const availableSides = sides.filter(i => this.board[i] === '');
        if (availableSides.length > 0) {
            return availableSides[Math.floor(Math.random() * availableSides.length)];
        }

        return -1; // No moves available
    }

    checkGameEnd() {
        const winner = this.checkWinner();
        
        if (winner) {
            this.endGame(winner);
            return true;
        }
        
        if (this.checkTie()) {
            this.endGame('tie');
            return true;
        }
        
        return false;
    }

    checkWinner() {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                // Highlight winning cells
                this.highlightWinningCells(combination);
                return this.board[a];
            }
        }
        return null;
    }

    checkTie() {
        return this.board.every(cell => cell !== '');
    }

    highlightWinningCells(combination) {
        combination.forEach(index => {
            this.cells[index].classList.add('winning');
        });
    }

    endGame(result) {
        this.gameActive = false;
        this.gameBoard.classList.add('game-over');
        
        let message = '';
        
        if (result === 'X') {
            message = '🎉 You won! Great job!';
            this.scores.player++;
        } else if (result === 'O') {
            message = '🤖 Computer wins! Try again!';
            this.scores.computer++;
        } else {
            message = '🤝 It\'s a tie! Good game!';
            this.scores.ties++;
        }
        
        this.gameMessageElement.textContent = message;
        this.currentPlayerElement.textContent = 'Game Over';
        
        // Update and save scores
        this.updateScoreDisplay();
        this.saveScores();
    }

    resetGame() {
        // Reset game state
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Reset UI
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.animation = '';
        });
        
        this.gameBoard.classList.remove('game-over', 'computer-thinking');
        this.gameMessageElement.textContent = '';
        this.updateGameStatus();
    }

    updateGameStatus() {
        if (this.gameActive) {
            if (this.currentPlayer === 'X') {
                this.currentPlayerElement.textContent = 'Your turn (X)';
            } else {
                this.currentPlayerElement.textContent = 'Computer thinking... 🤔';
            }
        }
    }

    updateScoreDisplay() {
        this.playerScoreElement.textContent = this.scores.player;
        this.computerScoreElement.textContent = this.scores.computer;
        this.tieScoreElement.textContent = this.scores.ties;
    }

    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }

    loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});

// Add keyboard support for accessibility
document.addEventListener('keydown', (event) => {
    if (event.key >= '1' && event.key <= '9') {
        const index = parseInt(event.key) - 1;
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.click();
        }
    }
    
    if (event.key === 'r' || event.key === 'R') {
        document.getElementById('reset-btn').click();
    }
});

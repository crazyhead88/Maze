const mazeContainer = document.getElementById("maze-container");
const generateButton = document.getElementById("generate-maze");
const solvemazeButton = document.getElementById("solve-maze");
const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
// const playerColorInput = document.getElementById("player-color");

let rows = parseInt(rowsInput.value);
let cols = parseInt(colsInput.value);
let grid = [];
let playerPosition = { row: 0, col: 0 };
let visitedCells = [];
// let playerColor = playerColorInput.value;
let reached = false;

function createEmptyGrid(rows, cols) {
    const grid = [];
    for (let i = 0; i < rows; i++) {
        grid.push(new Array(cols).fill(1)); // 1 is walls
    }
    return grid;
}


function generateMaze(grid) {
    const stack = [];
    const startRow = Math.floor(Math.random() * rows);
    const startCol = Math.floor(Math.random() * cols);

    stack.push([startRow, startCol]);
    grid[startRow][startCol] = 0; // 0 as path

    while (stack.length > 0) {
        const [currentRow, currentCol] = stack.pop();
        const directions = shuffleArray([
            [-1, 0], // up
            [1, 0], // down
            [0, -1], // left
            [0, 1], // right
        ]);

        for (const [dRow, dCol] of directions) {
            const newRow = currentRow + dRow * 2;
            const newCol = currentCol + dCol * 2;

            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols &&
                grid[newRow][newCol] === 1
            ) {
                grid[currentRow + dRow][currentCol + dCol] = 0; // Clear wall btwn cells
                grid[newRow][newCol] = 0; // Clear path
                stack.push([newRow, newCol]);
            }
        }
    }
    //Fuck, These two Lines are important 
    grid[0][0] = 0;
    grid[rows - 1][cols - 1] = 0;

    console.log(grid);
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderMaze(grid) {
    mazeContainer.innerHTML = "";
    mazeContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const div = document.createElement("div");
            div.classList.add("cell");

            if (cell === 1) div.classList.add("wall");
            if (cell === 0) div.classList.add("path");
            if (visitedCells.some(pos => pos.row === rowIndex && pos.col === colIndex)) div.classList.add("visited");
            if (rowIndex === playerPosition.row && colIndex === playerPosition.col) {
                div.classList.add("player");
                div.style.backgroundColor = "lightblue"; // Apply player color i dont know why i add tis
            }
            if (rowIndex === 0 && colIndex === 0) div.classList.add("start");
            if (rowIndex === rows - 1 && colIndex === cols - 1) div.classList.add("end");
            mazeContainer.appendChild(div);
        });
    });
}

function initializeMaze() {
    rows = parseInt(rowsInput.value);
    cols = parseInt(colsInput.value);
    // playerColor = playerColorInput.value; // it get player color from input
    playerPosition = { row: 0, col: 0 };
    visitedCells = [{ row: 0, col: 0 }];
    grid = createEmptyGrid(rows, cols);
    generateMaze(grid);
    const solution = solveMazeWithDirections(grid, playerPosition);
    if (solution != null) {
        renderMaze(grid);
    } else {
        initializeMaze();
    }

}

function movePlayer(direction) {
    const { row, col } = playerPosition;
    let newRow = row;
    let newCol = col;

    if (direction === "up" && row > 0 && grid[row - 1][col] === 0) newRow--;
    if (direction === "down" && row < rows - 1 && grid[row + 1][col] === 0) newRow++;
    if (direction === "left" && col > 0 && grid[row][col - 1] === 0) newCol--;
    if (direction === "right" && col < cols - 1 && grid[row][col + 1] === 0) newCol++;

    playerPosition = { row: newRow, col: newCol };
    visitedCells.push({ row: newRow, col: newCol });
    renderMaze(grid);

    // Check if the player reached the end
    if (newRow === rows - 1 && newCol === cols - 1) {
        
        document.querySelector("#play-again").style.display = 'inline';
    }
}


document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") movePlayer("up");
    if (event.key === "ArrowDown") movePlayer("down");
    if (event.key === "ArrowLeft") movePlayer("left");
    if (event.key === "ArrowRight") movePlayer("right");
});



generateButton.addEventListener("click", initializeMaze);

function solveit() {
    const solution = solveMazeWithDirections(grid, playerPosition);

    if (!solution) {
        alert("No solution exists for this maze.");
        return;
    }

    solvemazeButton.disabled = true; // Disable the button during animation

    let i = 0;
    const interval = setInterval(() => {
        if (i >= solution.length) {
            clearInterval(interval); // Stop animation when the path is complete
            solvemazeButton.disabled = false; // Re-enable the button
            return;
        }

        const move = solution[i];
        if (move === 1) movePlayer("up");
        if (move === 2) movePlayer("right");
        if (move === 3) movePlayer("down");
        if (move === 4) movePlayer("left");

        i++;
    }, 10); // to adjust delay
}


solvemazeButton.addEventListener("click", solveit);
// Generate the initial maze
initializeMaze();


//type 1 this has few problme 
// function solveMazeWithDirections(grid) {
//     const rows = grid.length;
//     const cols = grid[0].length;
//     let pos = `${playerPosition.row},${playerPosition.col}`;


//     // Directions for moving: [row offset, col offset, direction]
//     const directions = [
//         [-1, 0, 1], // up
//         [0, 1, 2],  // right
//         [1, 0, 3],  // down
//         [0, -1, 4], // left
//     ];

//     // Check if a position is valid
//     function isValid(row, col) {
//         return row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col] === 0;
//     }

//     // BFS queue: each entry contains [row, col, path]
//     const queue = [[0, 0, []]];
//     const visited = new Set();
//     visited.add(`0,0`);

//     while (queue.length > 0) {
//         const [row, col, path] = queue.shift();

//         // If the end is reached, return the path as directions
//         if (row === rows - 1 && col === cols - 1) {
//             return path;
//         }

//         // Explore all valid directions
//         for (const [dRow, dCol, direction] of directions) {
//             const newRow = row + dRow;
//             const newCol = col + dCol;

//             if (isValid(newRow, newCol) && !visited.has(`${newRow},${newCol}`)) {
//                 visited.add(`${newRow},${newCol}`);
//                 queue.push([newRow, newCol, [...path, direction]]);
//             }
//         }
//     }

//     // Return null if no path exists
//     return null;
// }

// console.log(solveMazeWithDirections(grid));


//type 2
function solveMazeWithDirections(grid, playerPosition) {
    const rows = grid.length;
    const cols = grid[0].length;

    // Directions for moving: [row offset, col offset, direction]
    const directions = [
        [-1, 0, 1], // up
        [0, 1, 2],  // right
        [1, 0, 3],  // down
        [0, -1, 4], // left
    ];

    // Check if a position is valid
    function isValid(row, col) {
        return row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col] === 0;
    }

    // BFS queue: each entry contains [row, col, path]
    const queue = [[playerPosition.row, playerPosition.col, []]];
    const visited = new Set();
    visited.add(`${playerPosition.row},${playerPosition.col}`);

    while (queue.length > 0) {
        const [row, col, path] = queue.shift();

        // If the end is reached, return the path as directions
        if (row === rows - 1 && col === cols - 1) {
            return path;
        }

        // Explore all valid directions
        for (const [dRow, dCol, direction] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (isValid(newRow, newCol) && !visited.has(`${newRow},${newCol}`)) {
                visited.add(`${newRow},${newCol}`);
                queue.push([newRow, newCol, [...path, direction]]);
            }
        }
    }

    // for no path 
    return null;
}


document.querySelector("#play-again").addEventListener("click", ()=>{
    document.querySelector("#play-again").style.display = 'none';
    initializeMaze();
})

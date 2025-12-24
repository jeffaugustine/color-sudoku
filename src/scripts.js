const debug = true;
const gridSize = 4;
const triangular = gridSize * (gridSize + 1) / 2;
const colors = ["#aaa", "#6dd3ce", "#c8e9a0", "#f7a278", "#a13d63"];
const gridState = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
const grid = document.getElementById("grid");
init();

function init() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.dataset.row = row;
            tile.dataset.col = col;

            tile.addEventListener("click", () => {
                const r = parseInt(tile.dataset.row);
                const c = parseInt(tile.dataset.col);

                // Update game state
                gridState[r][c] = (gridState[r][c] + 1) % colors.length;
                tile.style.backgroundColor = colors[gridState[r][c]];
                this.haveWeWon();

            });

            grid.appendChild(tile);
        }
    }
}

function haveWeWon() {

    const rowsSum = gridState.map(row => row.reduce((sum, val) => sum + val, 0));
    const rowsSolved = rowsSum.every(sum => sum === triangular);

    const colsSum = gridState[0].map((_, colIndex) => gridState.reduce((sum, row) => sum + row[colIndex], 0));
    const colSolved = colsSum.every(sum => sum === triangular);

    const cornersSum = sumCornerBlocks();
    const cornersSolved = cornersSum.every(sum => sum === triangular);

    const win = rowsSolved && colSolved && cornersSolved;
1
    if (debug) {
        console.clear();
        console.table(gridState);

        console.log("Have we won? ...", win);
        console.log("Row sums:", rowsSum, rowsSolved);
        console.log("Column sums:", colsSum, colSolved);
        console.log("Corner sums:", cornersSum, cornersSolved);

    }

}

function sumCornerBlocks(k = gridSize / 2) {
    const rows = gridState.length;
    const cols = gridState[0].length;

    // Helper to sum k×k block starting at (r,c)
    function sumBlock(startRow, startCol) {
        let sum = 0;
        for (let i = 0; i < k; i++) {
            for (let j = 0; j < k; j++) {
                sum += gridState[startRow + i][startCol + j];
            }
        }
        return sum;
    }

    return [
        sumBlock(0, 0), // top left
        sumBlock(0, cols - k), // top right
        sumBlock(rows - k, 0), // bottom left
        sumBlock(rows - k, cols - k) // bottom right
    ];
}
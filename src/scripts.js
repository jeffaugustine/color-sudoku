const debug = true;
let touchable = false;

const gridSize = 4;
const triangular = gridSize * (gridSize + 1) / 2;

const colors = ["#aaa", "#6dd3ce", "#c8e9a0", "#f7a278", "#a13d63"];
// let solution = [[1, 2, 3, 4], [3, 4, 1, 2], [4, 1, 2, 3], [2, 3, 4, 1]];
// let puzzle = [[0, 0, 0, 4], [3, 0, 0, 0], [4, 0, 0, 3], [0, 3, 4, 0]];
let puzzle = generatePuzzle();
let gridState = structuredClone(puzzle);

init();

function init() {
  const grid = document.getElementById("grid");
  
  // Add center lines
  const centerLine = document.createElement("div");
  centerLine.style.position = "absolute";
  centerLine.style.pointerEvents = "none";
  grid.style.position = "relative";
  
  const lineColor = "#fff";
  const lineWidth = "1px";
  const center = gridSize / 2;
  const tileSize = 100 / gridSize;
  
  // Vertical line
  const vLine = document.createElement("div");
  vLine.style.cssText = `position: absolute; width: ${lineWidth}; height: 100%; left: ${center * tileSize}%; top: 0; background: ${lineColor};`;
  grid.appendChild(vLine);
  
  // Horizontal line
  const hLine = document.createElement("div");
  hLine.style.cssText = `position: absolute; height: ${lineWidth}; width: 100%; top: ${center * tileSize}%; left: 0; background: ${lineColor};`;
  grid.appendChild(hLine);
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.row = row;
      tile.dataset.col = col;

      grid.appendChild(tile);
    }
  }

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
      tile.style.backgroundColor = colors[gridState[row][col]];
      if (gridState[row][col] > 0) {
        tile.style.pointerEvents = 'none';
        // tile.style.filter = 'brightness(80%)';
        tile.style.border = '4px dashed #fff';
      }
    }
  }
  touchable = true;

  // Improve mobile performance with pointerdown over onclick
  grid.addEventListener("pointerdown", (e) => {

    if (!e.target.classList.contains("tile")) return;

    const r = +e.target.dataset.row;
    const c = +e.target.dataset.col;

    // Update game state
    if (touchable) {
      gridState[r][c] = (gridState[r][c] + 1) % (colors.length);
      e.target.style.backgroundColor = colors[gridState[r][c]];

      haveWeWon();
    }

  }, { passive: true });

}

async function haveWeWon() {

  const rowsSum = gridState.map(row => row.reduce((sum, val) => sum + val, 0));
  const rowsSolved = rowsSum.every(sum => sum === triangular);

  const colsSum = gridState[0].map((_, colIndex) => gridState.reduce((sum, row) => sum + row[colIndex], 0));
  const colSolved = colsSum.every(sum => sum === triangular);

  const cornersSum = sumCornerBlocks();
  const cornersSolved = cornersSum.every(sum => sum === triangular);

  const win = rowsSolved && colSolved && cornersSolved;

  if (debug) {
    console.clear();
    console.table(gridState);

    console.log("Have we won? ...", win);
    console.log("Row sums:", rowsSum, rowsSolved);
    console.log("Column sums:", colsSum, colSolved);
    console.log("Corner sums:", cornersSum, cornersSolved);

  }

  if (win) {
    await animateWin();
    levelUp();
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

async function animateWin() {
  touchable = false;
  let spiralizer = spiralInCoordinates();
  for (let i = 0; i < spiralizer.length; i++) {
    const [row, col] = spiralizer[i];
    const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    tile.removeAttribute("style");
    // tile.style.backgroundColor = colors[gridState[row][col]];
    tile.style.backgroundColor = "green";
    tile.style.pointerEvents = 'none';
    // tile.style.filter = 'brightness(80%)';
    await sleep(200);
  }
  return;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function spiralInCoordinates() {
  const coords = [];

  let top = 0;
  let bottom = gridSize - 1;
  let left = 0;
  let right = gridSize - 1;

  while (top <= bottom && left <= right) {
    // Top row
    for (let c = left; c <= right; c++) {
      coords.push([top, c]);
    }
    top++;

    // Right column
    for (let r = top; r <= bottom; r++) {
      coords.push([r, right]);
    }
    right--;

    // Bottom row
    if (top <= bottom) {
      for (let c = right; c >= left; c--) {
        coords.push([bottom, c]);
      }
      bottom--;
    }

    // Left column
    if (left <= right) {
      for (let r = bottom; r >= top; r--) {
        coords.push([r, left]);
      }
      left++;
    }
  }

  return coords;
}

function spiralOutCoordinates(startRow = -1, startCol = -1) {
  const coords = [];
  const total = gridSize * gridSize;

  // Starting cell
  let r = (startRow > -1) ? startRow : Math.floor(gridSize / 2);
  let c = (startCol > -1) ? startCol : Math.floor(gridSize / 2);

  coords.push([r, c]);

  let step = 1;
  while (coords.length < total) {
    // Move right
    for (let i = 0; i < step && coords.length < total; i++) {
      c++;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) coords.push([r, c]);
    }
    // Move down
    for (let i = 0; i < step && coords.length < total; i++) {
      r++;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) coords.push([r, c]);
    }
    step++;

    // Move left
    for (let i = 0; i < step && coords.length < total; i++) {
      c--;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) coords.push([r, c]);
    }
    // Move up
    for (let i = 0; i < step && coords.length < total; i++) {
      r--;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) coords.push([r, c]);
    }
    step++;
  }

  return coords;
}

// Restart button
async function restart() {
  console.log("Restart");
  gridState = structuredClone(puzzle); // deep copy

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
      if (gridState[row][col] > 0) {
        tile.style.pointerEvents = 'none';
        // tile.style.filter = 'brightness(80%)';
        tile.style.border = '4px dashed #fff';
      } else {
        tile.removeAttribute("style");
      }
      tile.style.backgroundColor = colors[gridState[row][col]];
    }
  }
  touchable = true;
}

async function levelUp() {
  console.log("Level up!");
  puzzle = generatePuzzle();
  gridState = structuredClone(puzzle); // deep copy

  let spiralizer = spiralOutCoordinates(1, 1);
  for (let i = 0; i < spiralizer.length; i++) {
    const [row, col] = spiralizer[i];
    const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    if (gridState[row][col] > 0) {
      tile.style.pointerEvents = 'none';
      // tile.style.filter = 'brightness(80%)';
      tile.style.border = '4px dashed #fff';
    } else {
      tile.removeAttribute("style");
    }
    tile.style.backgroundColor = colors[gridState[row][col]];
    await sleep(200);
  }
  touchable = true;
}

// New game button
function mulligan() {
  console.log("mulligan");

  puzzle = generatePuzzle();
  gridState = structuredClone(puzzle); // deep copy

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
      if (gridState[row][col] > 0) {
        tile.style.pointerEvents = 'none';
        // tile.style.filter = 'brightness(80%)';
        tile.style.border = '4px dashed #fff';
      } else {
        tile.removeAttribute("style");
      }
      tile.style.backgroundColor = colors[gridState[row][col]];
    }
  }

}

// Win button
// function win() {
//   console.log("win");
//   gridState = [[1, 2, 3, 4], [3, 4, 1, 2], [4, 1, 2, 3], [2, 3, 4, 1]];

//   for (let row = 0; row < gridSize; row++) {
//     for (let col = 0; col < gridSize; col++) {
//       const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
//       tile.style.backgroundColor = colors[gridState[row][col]];
//     }
//   }

//   haveWeWon();
// }

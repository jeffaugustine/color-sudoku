function isValid(grid, row, col, num) {
  for (let i = 0; i < 4; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 2) * 2;
  const startCol = Math.floor(col / 2) * 2;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      if (grid[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
}

function solveAndCount(grid, countObj) {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 4; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            solveAndCount(grid, countObj);
            grid[row][col] = 0;
          }
        }
        return; // stop until this cell is filled
      }
    }
  }
  countObj.count++;
}

function hasUniqueSolution(puzzle) {
  const copy = puzzle.map(row => row.slice());
  const countObj = { count: 0 };
  solveAndCount(copy, countObj);
  return countObj.count === 1;
}

// --- Generator ---
function generateSolved4x4() {
  const base = [[1, 2, 3, 4], [3, 4, 1, 2], [4, 1, 2, 3], [2, 3, 4, 1]];
  // Random digit permutation
  const perm = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
  return base.map(row => row.map(val => perm[val - 1]));
}

function generatePuzzle() {
  let puzzle = generateSolved4x4();

  // Randomize cell order
  let cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      cells.push([r, c]);
    }
  }
  cells.sort(() => Math.random() - 0.5);

  // Try removing numbers while keeping uniqueness
  for (let [r, c] of cells) {
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (!hasUniqueSolution(puzzle)) {
      puzzle[r][c] = backup; // restore if uniqueness lost
    }
  }
  return puzzle;
}
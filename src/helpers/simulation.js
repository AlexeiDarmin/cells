// Map constants
const MAP_SIZE = 100
const CELL_SIZE = 4
const MAX_VALID_POSITION = (MAP_SIZE / CELL_SIZE) - 1

const MAX_STAT = 100
const TICK_RATE = 16

class Simulation {
  cells = []
  board = []  // tracks which sections of the board are occupied
  gameInterval

  constructor(cellCount) {
    const cells = []

    // initializes board dimensions
    const board = []
    for (let x = 0; x < MAP_SIZE / CELL_SIZE; ++x) {
      board.push([])
      for (let y = 0; y < MAP_SIZE / CELL_SIZE; ++y) {
        board[x].push(0)
      }
    }
    this.board = board
    for (let i = 0; i < cellCount; ++i) {
      const newCell = this.createRandomCell()
      cells.push(newCell)
      this.board[newCell.position.x][newCell.position.y] = 1
    }

    // initializes board state based on cell positions
    cells.forEach(c => {
      board[c.position.x][c.position.y] = 1
    })

    this.cells = cells
  }

  start = () => {
    this.gameInterval = setInterval(this.runGameTick, TICK_RATE)
  }

  stop = () => {
    clearInterval(this.gameInterval)
  }

  runGameTick = () => {
    this.moveCells()
    this.ageCells()
    this.reproduceCells()
  }

  reproduceCells = () => {
    const newCells = []
    this.cells.map(c => {
      if (c.age % 100 === 0) {
        newCells.push(this.createMutatedCellFromCell(c))
      }
    })
    this.cells = [...this.cells, ...newCells]
  }

  ageCells = () => {
    this.cells = this.cells.map(c => {
      c.age++
      if (c.age / 60 > c.maxAge * 1000) return null // cell death by old age
      return c
    }).filter(c => c !== null)
  }

  moveCells = () => {
    this.cells = this.cells.map(c => {
      if (c.age % 4 !== 0) return c

      const { position } = c
      const newPosition = mutatePosition(position, this.board)
      c.position = newPosition
      return c
    })
  }

  createRandomCell = () => {
    return this.balanceCell({
      health: getRandomArbitrary(50, MAX_STAT),
      attack: getRandomArbitrary(50, MAX_STAT),
      agility: getRandomArbitrary(50, MAX_STAT),
      maxAge: getRandomArbitrary(50, MAX_STAT),
      lineage: getRandomColor(),
      age: 0,
      id: uuid(),
      position: generateRandomEmptyPosition(this.board)
    })
  }

  createMutatedCellFromCell = (cell) => {
    return this.balanceCell({
      health: mutateProperty(cell.health),
      attack: mutateProperty(cell.attack),
      agility: mutateProperty(cell.agility),
      maxAge: mutateProperty(cell.agility),
      age: 0,
      id: uuid(),
      lineage: cell.lineage,
      position: mutatePosition(cell.position, this.board)
    })
  }

  // Rebalances cell traits such they the sum of all traits is equal to 100.
  balanceCell = (cell) => {
    const { health, attack, agility, maxAge } = cell
    const sum = health + attack + agility + maxAge

    return {
      health: health / sum,
      attack: attack / sum,
      agility: agility / sum,
      maxAge: maxAge / sum,
      age: cell.age,
      position: cell.position,
      lineage: cell.lineage,
      id: cell.id,
    }
  }

}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function mutateProperty(property) {
  return getRandomArbitrary(-0.03, 0.03) * property
}

// Randomly considers moving a cell, if the area where the cell wants to move is occupied, the cell does not move.
function mutatePosition(position, board) {
  const newXRaw = Math.round(getRandomArbitrary(-1, 1)) + position.x
  const newYRaw = Math.round(getRandomArbitrary(-1, 1)) + position.y

  const newX = (newXRaw < 0) ? 0 : (newXRaw <= MAX_VALID_POSITION) ? newXRaw : MAX_VALID_POSITION
  const newY = (newYRaw < 0) ? 0 : (newYRaw <= MAX_VALID_POSITION) ? newYRaw : MAX_VALID_POSITION
  try {
    if (board[newX][newY] === 1) return position
  } catch (e) {
    debugger
  }
  return {
    x: newX,
    y: newY
  }
}

// Hacky way to keep randomly generating positions until an empty one is found
function generateRandomEmptyPosition(board) {
  let emptyPosition = false
  let position
  while (!emptyPosition) {
    position = generateRandomPosition()
    if (board[position.x][position.y] === 0) emptyPosition = true
  }

  return position
}

function generateRandomPosition() {
  return {
    x: Math.round(getRandomArbitrary(0, MAP_SIZE / CELL_SIZE)),
    y: Math.round(getRandomArbitrary(0, MAP_SIZE / CELL_SIZE)),
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default Simulation
// Map constants
const MAP_SIZE = 200
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
      this.board[newCell.position.x][newCell.position.y] = newCell
    }
    cells.map(c => {
      console.log(c)
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
      if (c.age % (c.reproductionRate / 60 * 3000) === 0) {
        const newCell = this.tryToReproduce(c)
        if (newCell) {
          newCells.push(newCell)
        }
      }
    })
    this.cells = [...this.cells, ...newCells]
  }

  // Tries to create a mutated cell adjacent to given cell and returns new cell upon success
  // If all adjacent grids are occupied, then nothing happens.
  tryToReproduce = (cell) => {
    const { position: { x, y } } = cell
    const board = this.board
    let newPosition = null
    if (y < MAX_VALID_POSITION && board[x, y + 1] === 0) {
      newPosition = { x: x, y: y + 1 }
    } else if (y > 0 && board[x][y - 1] === 0) {
      newPosition = { x: x, y: y - 1 }
    } else if (x > 0 && board[x - 1][y] === 0) {
      newPosition = { x: x - 1, y: y }
    } else if (x < MAX_VALID_POSITION && board[x + 1][y] === 0) {
      newPosition = { x: x + 1, y: y }
    }

    if (newPosition !== null) return this.createMutatedCellFromCell(cell, newPosition)
    return
  }

  ageCells = () => {
    this.cells = this.cells.map(c => {
      c.age++
      if (c.age / 60 > c.maxAge * 100) return null // cell death by old age
      return c
    }).filter(c => c !== null)
  }

  moveCells = () => {
    this.cells = this.cells.map(c => {
      if (!c || c.health < 0) return null
      if (c.age % 4 !== 0) return c
      this.moveOrAttack(c)
      return (c.health > 0) ? c : null
    }).filter(c => c !== null)
  }

  createRandomCell = () => {
    return this.balanceCell({
      health: getRandomArbitrary(50, MAX_STAT),
      attack: getRandomArbitrary(50, MAX_STAT),
      agility: getRandomArbitrary(50, MAX_STAT),
      maxAge: getRandomArbitrary(50, MAX_STAT),
      reproductionRate: getRandomArbitrary(50, MAX_STAT),
      lineage: getRandomColor(),
      age: 0,
      id: uuid(),
      position: this.generateRandomEmptyPosition()
    })
  }

  createMutatedCellFromCell = (cell, position) => {
    return this.balanceCell({
      health: mutateProperty(cell.health),
      attack: mutateProperty(cell.attack),
      agility: mutateProperty(cell.agility),
      maxAge: mutateProperty(cell.agility),
      reproductionRate: mutateProperty(cell.reproductionRate),
      age: 0,
      id: uuid(),
      lineage: cell.lineage,
      position: position
    })
  }

  // Rebalances cell traits such they the sum of all traits is equal to 100.
  balanceCell = (cell) => {
    const { health, attack, agility, maxAge, reproductionRate } = cell
    const sum = health + attack + agility + maxAge + reproductionRate

    return {
      health: Math.round((health / sum) * 100),
      attack: Math.round((attack / sum) * 100),
      agility: Math.round((agility / sum) * 100),
      maxAge: Math.round((maxAge / sum) * 100),
      reproductionRate: Math.round((reproductionRate / sum) * 100),
      age: cell.age,
      position: cell.position,
      lineage: cell.lineage,
      id: cell.id,
    }
  }

  moveOrAttack = (cell) => {
    const { position } = cell
    const { board } = this

    const newPosition = mutatePosition(position, board)

    if (board[newPosition.x][newPosition.y] !== 0) {
      const cell2 = board[newPosition.x][newPosition.y]

      if (cell2.lineage !== cell.lineage) {
        const { c1, c2 } = this.fightCells(cell, cell2)

        if (c1.health < 0 && c2.health < 0) {
          board[c2.position.x][c2.position.y] = 0
          board[c1.position.x][c1.position.y] = 0
          return null
        } else if (c2.health < 0) {
          board[c2.position.x][c2.position.y] = 0
          return this.moveCell(cell, newPosition)
        } else if (c1.health < 0) {
          board[c1.position.x][c1.position.y] = 0
          return null
        }
      } else {
        cell.health -= 0.05 // damage for being stationary
        return null
      }
    }
    return this.moveCell(cell, newPosition)
  }

  moveCell(c, newPosition) {
    this.board[c.position.x][c.position.y] = 0
    c.position = newPosition
    this.board[c.position.x][c.position.y] = c
  }

  fightCells(c1, c2) {
    while (c1.health > 0 && c2.health > 0) {
      if (getRandomArbitrary(0, 100) > c2.agility) {
        c2.health -= c1.attack
      }
      if (getRandomArbitrary(0, 100) > c1.agility) {
        c1.health -= c2.attack
      }
    }

    return {
      c1,
      c2
    }
  }

  // Hacky way to keep randomly generating positions until an empty one is found
  generateRandomEmptyPosition() {
    const board = this.board
    let emptyPosition = false
    let position
    while (!emptyPosition) {
      position = generateRandomPosition()
      if (board[position.x][position.y] === 0) emptyPosition = true
    }

    return position
  }

}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function mutateProperty(property) {
  const v = getRandomArbitrary(-0.03, 0.03) * property

  return v > 0 ? v : 1
}

// Randomly considers moving a cell, if the area where the cell wants to move is occupied, the cell does not move.
function mutatePosition(position, board) {
  const newXRaw = Math.round(getRandomArbitrary(-1, 1)) + position.x
  const newYRaw = Math.round(getRandomArbitrary(-1, 1)) + position.y

  const newX = (newXRaw < 0) ? 0 : (newXRaw <= MAX_VALID_POSITION) ? newXRaw : MAX_VALID_POSITION
  const newY = (newYRaw < 0) ? 0 : (newYRaw <= MAX_VALID_POSITION) ? newYRaw : MAX_VALID_POSITION

  // if (board[newX][newY] !== 0) return position

  return {
    x: newX,
    y: newY
  }
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
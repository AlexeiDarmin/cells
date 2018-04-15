// Map constants
const MAP_SIZE = 250
const CELL_SIZE = 4
const MAX_VALID_POSITION = MAP_SIZE - CELL_SIZE

const MAX_STAT = 100
const TICK_RATE = 16

class Simulation {
  cells = []

  constructor(cellCount) {
    const cells = []
    let gameInterval

    for (let i = 0; i < cellCount; ++i) {
      cells.push(createRandomCell())
    }
    this.cells = cells
  }

  start = () => {
    debugger
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
      if (c.age % 180 === 0) {
        newCells.push(createMutatedCellFromCell(c))
      }
    })
    this.cells = [...this.cells, ...newCells]
  }

  ageCells = () => {
    this.cells = this.cells.map(c => {
      c.age++
      if (c.age > c.maxAge * 2000) return null // cell death by old age
      return c
    }).filter(c => c !== null)
  }

  moveCells = () => {
    this.cells = this.cells.map(c => {
      const { position } = c
      const newPosition = mutatePosition(position)
      c.position = newPosition
      return c
    })
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function mutateProperty(property) {
  return getRandomArbitrary(-0.03, 0.03) * property
}

function mutatePosition(position) {
  const newXRaw = getRandomArbitrary(-1, 1) + position.x
  const newYRaw = getRandomArbitrary(-1, 1) + position.y

  const newX = (newXRaw < 0) ? 0 : (newXRaw <= MAX_VALID_POSITION) ? newXRaw : MAX_VALID_POSITION
  const newY = (newYRaw < 0) ? 0 : (newYRaw <= MAX_VALID_POSITION) ? newYRaw : MAX_VALID_POSITION

  return {
    x: newX,
    y: newY
  }
}

// Rebalances cell traits such they the sum of all traits is equal to 100.
function balanceCell(cell) {
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
  }
}

function createRandomCell () {
  return balanceCell({
    health: getRandomArbitrary(50, MAX_STAT),
    attack: getRandomArbitrary(50, MAX_STAT),
    agility: getRandomArbitrary(50, MAX_STAT),
    maxAge: getRandomArbitrary(50, MAX_STAT),
    lineage: getRandomColor(),
    age: 0, 
    position: {
      x: Math.round(getRandomArbitrary(0, MAP_SIZE - CELL_SIZE)),
      y: Math.round(getRandomArbitrary(0, MAP_SIZE - CELL_SIZE))
    }
  })
}

function createMutatedCellFromCell (cell) {
  return balanceCell({
    health: mutateProperty(cell.health),
    attack: mutateProperty(cell.attack),
    agility: mutateProperty(cell.agility),
    maxAge: mutateProperty(cell.agility),
    age: 0,
    lineage: cell.lineage,
    position: mutatePosition(cell.position)
  })
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}



export default Simulation
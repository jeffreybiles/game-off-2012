level = require('./level')
lvl1 = object(level)

lvl1.grid = [
  [1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 3, 3, 2],
  [1, 2, 1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 3, 3, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1],
  [2, 4, 4, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
  [2, 4, 4, 2, 1, 2, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 2],
  [2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2],
  [1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2],
  [1, 5, 5, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2],
  [2, 5, 5, 1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2],
  [2, 2, 2, 2, 1, 1, 2, 2, 1, 2, 1, 2, 1, 3, 3, 2],
  [1, 2, 2, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 3, 3, 2]
]

lvl1.numEnemies = 3

module.exports = lvl1
level = require('./level')
lvl2 = object(level)

lvl2.grid = [
  '1111111111111111',
  '1111111111111111',
  '3333333331111111',
  '1111111131111111',
  '1111111131111111',
  '1111111131111111',
  '2221111131222222',
  '1121111131211111',
  '1121111131211111',
  '1121111131211111',
  '1122222222211111',
  '1111111111111111',
  ]

lvl2.numEnemies = 3
lvl2.createTerrain()

module.exports = lvl2
level = new Object()
grass = require('./terrain/grass')
lava = require('./terrain/lava')
dirt = require('./terrain/dirt')
wall = require('./terrain/wall')
thorns = require('./terrain/thorns')


#ok, test this out using jasmine
level.createTerrain = ->
  @terrain = []
  for i in [0...@grid.length]
    row = []
    for j in [0...@grid[0].length]
      newSquare = switch @grid[i][j]
        when '1' then object(grass)
        when '2' then object(dirt)
        when '3' then object(wall)
        when '4' then object(thorns)
        when '5' then object(lava)
      newSquare.row = i
      newSquare.column = j
      row.push(newSquare)
    @terrain.push(row)

level.draw = (offset = 0) ->
  for row in [0...@terrain.length]
    for column in [0...@terrain[0].length]
      @terrain[row][column].draw(offset)

level.columnWidth = 50
level.rowHeight = 50

level.interactWith = (entity) ->
  column = Math.floor(entity.x/@columnWidth)
  row = Math.floor(entity.y/@rowHeight)
  squaresOccupied = [[row, column],
                     [row + 1, column],
                     [row, column + 1],
                     [row + 1, column + 1]
                    ]

  for [row, column] in squaresOccupied
    square = @terrain[row][column]
    entity.knockback({x: column*@rowHeight, y: row*@columnWidth}, square.bounciness)
    entity.hp -= square.damage

level.squareOpen = (row, column) ->
  if row < 0 or column < 0 or row > 11 or column > 15
    return false
  else
    return @terrain[row][column].passable()

module.exports = level
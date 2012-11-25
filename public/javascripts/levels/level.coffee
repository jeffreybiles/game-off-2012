level = new Object()

squares = {1: {color: '#68432a'}, 2: {color: '#126822'}}
width = 50
height = 50

level.draw = ->
  for row in [0...12]
    for column in [0...16]
      @drawSquare(row, column)

level.drawSquare = (row, column) ->
  square = @grid[row][column]
  ctx.fillStyle = squares[square].color
  ctx.fillRect(column*width, row*height, width, height)

module.exports = level
terrain = new Object()
terrain.width = 50
terrain.height = 50


terrain.color = '#342564'
terrain.bounciness = 0
terrain.damage = 0
terrain.row = 0
terrain.column = 0

terrain.draw = (offset = 0) ->
  ctx.fillStyle = @color
  ctx.fillRect(@column*@width + offset, @row*@height, @width, @height)

terrain.passable = ->
  @bounciness + @damage == 0

module.exports = terrain
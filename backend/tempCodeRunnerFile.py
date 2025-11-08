import turtle

screen = turtle.Screen()
screen.title("Circle and Triangle with Fill")

t = turtle.Turtle()
t.speed(1)

# Draw filled circle (red)
t.up()
t.goto(-100, 0)
t.down()
t.fillcolor("red")
t.begin_fill()
t.circle(50)
t.end_fill()

# Draw filled triangle (purple)
t.up()
t.goto(100, -30)
t.down()
t.fillcolor("purple")
t.begin_fill()
for _ in range(3):
    t.forward(120)
    t.left(120)
t.end_fill()

t.hideturtle()
screen.mainloop()
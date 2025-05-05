import tkinter as tk

def draw_circle(canvas, x, y, radius, color):
    canvas.create_oval(x - radius, y - radius, x + radius, y + radius, fill=color)

root = tk.Tk()
root.title("カラフルな丸")

canvas_width = 300
canvas_height = 200
canvas = tk.Canvas(root, width=canvas_width, height=canvas_height, bg="white")
canvas.pack()

# いろんな色の丸を描画してみよう！
draw_circle(canvas, 50, 50, 30, "red")
draw_circle(canvas, 150, 100, 50, "blue")
draw_circle(canvas, 250, 150, 20, "green")

root.mainloop()
"""產生 LED 跑馬燈 App icon（黑底 + 紅色 LED 點陣風格的字）。一次性工具。"""
from PIL import Image, ImageDraw

def make(size, path):
    img = Image.new("RGB", (size, size), "#000000")
    d = ImageDraw.Draw(img)
    # LED 點陣背景（暗紅點）
    dot = max(2, size // 48)
    gap = dot * 2
    r = dot // 2
    for y in range(gap, size - gap, gap):
        for x in range(gap, size - gap, gap):
            d.ellipse([x - r, y - r, x + r, y + r], fill="#1a0000")

    # 亮紅色的「跑馬燈箭頭」三條橫槓 + 箭頭，象徵滾動
    red = "#ff2d2d"
    cx, cy = size // 2, size // 2
    bar_h = size // 10
    bar_w = size * 0.5
    gap_y = bar_h * 1.6
    for i in range(3):
        yy = cy - gap_y + i * gap_y
        x0 = cx - bar_w / 2
        d.rounded_rectangle([x0, yy - bar_h/2, x0 + bar_w, yy + bar_h/2],
                            radius=bar_h/2, fill=red)
    # 右側箭頭
    ax = cx + bar_w / 2 + size * 0.04
    ah = gap_y * 2
    d.polygon([(ax, cy - ah/2), (ax + size*0.16, cy), (ax, cy + ah/2)], fill=red)

    img.save(path)
    print("wrote", path)

make(192, "icon-192.png")
make(512, "icon-512.png")
make(180, "icon-180.png")
print("done")

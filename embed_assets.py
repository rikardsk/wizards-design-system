import os
import base64

def generate():
    print("Reading tiles from local directories...")
    js_content = "window.TILE_ASSETS = {\n"
    
    # Process standard tiles (game tiles)
    js_content += "  standard: {\n"
    std_dir = "game tiles"
    if os.path.exists(std_dir):
        for f in os.listdir(std_dir):
            if f.endswith(".png"):
                name = os.path.splitext(f)[0]
                filepath = os.path.join(std_dir, f)
                with open(filepath, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                js_content += f'    "{name}": "data:image/png;base64,{encoded_string}",\n'
    js_content += "  },\n"
    
    # Process large tiles (game tiles large)
    js_content += "  large: {\n"
    large_dir = "game tiles large"
    if os.path.exists(large_dir):
        for f in os.listdir(large_dir):
            if f.endswith(".png"):
                name = os.path.splitext(f)[0]
                filepath = os.path.join(large_dir, f)
                with open(filepath, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                js_content += f'    "{name}": "data:image/png;base64,{encoded_string}",\n'
    js_content += "  }\n"
    
    js_content += "};\n"
    
    with open("assets_base64.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    print("Successfully generated assets_base64.js!")

if __name__ == "__main__":
    generate()

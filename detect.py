from ultralytics import YOLO
import sys
import json
import os

os.environ["YOLO_VERBOSE"] = "False"

model = YOLO("yolov8n.pt")

image_path = sys.argv[1]

results = model(image_path, conf=0.1, verbose=False)

output = []

for r in results:
    if r.boxes is not None:
        for box in r.boxes:
            output.append({
                "class": model.names[int(box.cls)],
                "confidence": float(box.conf)
            })

print(json.dumps(output))
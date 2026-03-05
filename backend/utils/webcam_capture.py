import cv2

# Keep VideoCapture active to allow 10-15 FPS. Re-opening on every frame is too slow.
_cap = None

def capture_frame():
    global _cap
    if _cap is None:
        _cap = cv2.VideoCapture(0)
        _cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        _cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        _cap.set(cv2.CAP_PROP_FPS, 15)
        
    ret, frame = _cap.read()
    return frame if ret else None

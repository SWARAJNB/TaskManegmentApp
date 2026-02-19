from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_websocket_connection():
    with client.websocket_connect("/ws/test_client_id") as websocket:
        # 1. Connection established
        # 2. Send a message
        websocket.send_text("Hello Server")
        
        # 3. Receive a message (if our server echoes back, or just check no error on close)
        # In our implementation, the server doesn't echo back immediately unless broadcasted.
        # But connection should be successful.
        assert websocket.scope["root_path"] == ""


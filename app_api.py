# Backward-compatible launcher. Existing command `python app_api.py` still works.
from backend.app import app

if __name__ == '__main__':
    app.run(debug=True, port=5000)

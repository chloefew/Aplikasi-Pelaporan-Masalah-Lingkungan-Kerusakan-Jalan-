import json
import os
from datetime import datetime
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / 'uploads'
DATA_FILE = BASE_DIR / 'reports.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

UPLOAD_FOLDER.mkdir(exist_ok=True)
if not DATA_FILE.exists():
    DATA_FILE.write_text('[]', encoding='utf-8')

app = Flask(__name__, static_folder='public', static_url_path='')
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_reports():
    try:
        return json.loads(DATA_FILE.read_text(encoding='utf-8'))
    except (json.JSONDecodeError, OSError):
        return []


def save_reports(reports):
    DATA_FILE.write_text(json.dumps(reports, indent=2, ensure_ascii=False), encoding='utf-8')


@app.route('/api/reports', methods=['GET'])
def get_reports():
    return jsonify(load_reports())


@app.route('/api/reports', methods=['POST'])
def submit_report():
    if 'photo' not in request.files:
        return jsonify({'error': 'Foto wajib diunggah.'}), 400

    photo = request.files['photo']
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    description = request.form.get('description', '')
    place = request.form.get('place', '')

    if not latitude or not longitude:
        return jsonify({'error': 'Lokasi GPS wajib diisi.'}), 400

    if photo.filename == '' or not allowed_file(photo.filename):
        return jsonify({'error': 'File foto tidak valid.'}), 400

    filename = f"{int(datetime.utcnow().timestamp() * 1000)}_{secure_filename(photo.filename)}"
    filepath = UPLOAD_FOLDER / filename
    photo.save(str(filepath))

    report = {
        'id': int(datetime.utcnow().timestamp() * 1000),
        'description': description,
        'place': place,
        'latitude': float(latitude),
        'longitude': float(longitude),
        'photo': f'/uploads/{filename}',
        'createdAt': datetime.utcnow().isoformat() + 'Z'
    }

    reports = load_reports()
    reports.insert(0, report)
    save_reports(reports)
    return jsonify({'success': True, 'report': report})


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != '' and (BASE_DIR / 'public' / path).exists():
        return send_from_directory('public', path)
    return send_from_directory('public', 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)

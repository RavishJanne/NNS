from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
from pymysql import connect, cursors

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',      # Update with your MySQL username
    'password': '',      # Update with your MySQL password
    'database': 'nns_database',
    'cursorclass': cursors.DictCursor
}

def get_db_connection():
    """Create and return a database connection."""
    return connect(**DB_CONFIG)

# Initialize database and table
def init_db():
    """Initialize the database and create the applications table if it doesn't exist."""
    try:
        connection = connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("CREATE DATABASE IF NOT EXISTS nns_database")
            cursor.execute("USE nns_database")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS applications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    interest VARCHAR(255),
                    message TEXT,
                    created_at DATETIME
                )
            """)
            connection.commit()
            cursor.close()
            connection.close()
            print("Database initialization successful")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Run database initialization on startup
init_db()

# Connect to MongoDB
# Ensure MongoDB is running locally on the default port
client = MongoClient('mongodb://localhost:27017/')
db = client['nns_database']
applications_collection = db['applications']

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({"error": "Name and email are required"}), 400

    submission = {
        "name": data.get('name'),
        "email": data.get('email'),
        "interest": data.get('interest'),
        "message": data.get('message'),
        "created_at": datetime.datetime.utcnow()
    }
    
    try:
        # Insert into MongoDB
        result = applications_collection.insert_one(submission)
        return jsonify({
            "success": True, 
            "message": "Submission received successfully",
            "id": str(result.inserted_id)
        }), 201
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Database error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

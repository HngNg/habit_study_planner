# backend/main.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://localhost/habit_planner')

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create habits table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS habits (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(50),
            frequency VARCHAR(20),
            target_days INTEGER[],
            start_date DATE,
            icon VARCHAR(10),
            color VARCHAR(20),
            reminder_time TIME,
            atomic_cue TEXT,
            atomic_craving TEXT,
            atomic_response TEXT,
            atomic_reward TEXT,
            points INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create habit_logs table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS habit_logs (
            id SERIAL PRIMARY KEY,
            habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            notes TEXT,
            duration INTEGER,
            mood VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(habit_id, date)
        )
    ''')
    
    # Create streaks table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS streaks (
            id SERIAL PRIMARY KEY,
            habit_id INTEGER UNIQUE REFERENCES habits(id) ON DELETE CASCADE,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_completed_date DATE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create user_progress table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) UNIQUE,
            total_points INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            badges JSONB DEFAULT '[]',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

# Initialize database on startup
init_db()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# ==================== HABITS ENDPOINTS ====================

@app.route('/api/habits', methods=['GET'])
def get_habits():
    """Get all habits for a user"""
    user_id = request.args.get('user_id', 'default')
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM habits WHERE user_id = %s ORDER BY created_at DESC', (user_id,))
    habits = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify([dict(h) for h in habits])

@app.route('/api/habits', methods=['POST'])
def create_habit():
    """Create a new habit"""
    data = request.json
    user_id = data.get('user_id', 'default')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO habits (
            user_id, name, description, category, frequency, 
            start_date, icon, color, reminder_time,
            atomic_cue, atomic_craving, atomic_response, atomic_reward
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    ''', (
        user_id, data['name'], data['description'], data['category'],
        data['frequency'], data['startDate'], data['icon'], data['color'],
        data.get('reminderTime'), data['atomicCue'], data['atomicCraving'],
        data['atomicResponse'], data['atomicReward']
    ))
    
    habit_id = cur.fetchone()['id']
    
    # Initialize streak for this habit
    cur.execute('''
        INSERT INTO streaks (habit_id, current_streak, longest_streak)
        VALUES (%s, 0, 0)
    ''', (habit_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'id': habit_id, 'message': 'Habit created successfully'}), 201

@app.route('/api/habits/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    """Update an existing habit"""
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        UPDATE habits SET
            name = %s, description = %s, category = %s,
            frequency = %s, icon = %s, color = %s,
            atomic_cue = %s, atomic_craving = %s,
            atomic_response = %s, atomic_reward = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    ''', (
        data['name'], data['description'], data['category'],
        data['frequency'], data['icon'], data['color'],
        data['atomicCue'], data['atomicCraving'],
        data['atomicResponse'], data['atomicReward'], habit_id
    ))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'message': 'Habit updated successfully'})

@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    """Delete a habit"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM habits WHERE id = %s', (habit_id,))
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'message': 'Habit deleted successfully'})

# ==================== HABIT LOGS ENDPOINTS ====================

@app.route('/api/logs', methods=['POST'])
def create_log():
    """Log a habit completion"""
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Insert or update log
    cur.execute('''
        INSERT INTO habit_logs (habit_id, date, completed, notes, duration, mood)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (habit_id, date) 
        DO UPDATE SET completed = EXCLUDED.completed,
                     notes = EXCLUDED.notes,
                     duration = EXCLUDED.duration,
                     mood = EXCLUDED.mood
        RETURNING id
    ''', (
        data['habitId'], data['date'], data['completed'],
        data.get('notes'), data.get('duration'), data.get('mood')
    ))
    
    log_id = cur.fetchone()['id']
    
    # Update streak if completed
    if data['completed']:
        update_streak(cur, data['habitId'], data['date'])
        award_points(cur, data['habitId'], 10)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'id': log_id, 'message': 'Log created successfully'}), 201

@app.route('/api/logs/<int:habit_id>', methods=['GET'])
def get_logs(habit_id):
    """Get logs for a specific habit"""
    days = request.args.get('days', 30, type=int)
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT * FROM habit_logs 
        WHERE habit_id = %s 
        ORDER BY date DESC 
        LIMIT %s
    ''', (habit_id, days))
    logs = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify([dict(log) for log in logs])

# ==================== STREAKS ENDPOINTS ====================

@app.route('/api/streaks/<int:habit_id>', methods=['GET'])
def get_streak(habit_id):
    """Get streak for a specific habit"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM streaks WHERE habit_id = %s', (habit_id,))
    streak = cur.fetchone()
    cur.close()
    conn.close()
    
    return jsonify(dict(streak) if streak else {})

@app.route('/api/streaks', methods=['GET'])
def get_all_streaks():
    """Get all streaks with habit info"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT s.*, h.name as habit_name, h.icon as habit_icon, h.color
        FROM streaks s
        JOIN habits h ON s.habit_id = h.id
        ORDER BY s.current_streak DESC
    ''')
    streaks = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify([dict(s) for s in streaks])

# ==================== ANALYTICS ENDPOINTS ====================

@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get analytics summary"""
    user_id = request.args.get('user_id', 'default')
    days = request.args.get('days', 30, type=int)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get habit count
    cur.execute('SELECT COUNT(*) as count FROM habits WHERE user_id = %s', (user_id,))
    total_habits = cur.fetchone()['count']
    
    # Get completion rate
    cur.execute('''
        SELECT 
            COUNT(*) as total_logs,
            SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_logs
        FROM habit_logs hl
        JOIN habits h ON hl.habit_id = h.id
        WHERE h.user_id = %s AND hl.date >= CURRENT_DATE - INTERVAL '%s days'
    ''', (user_id, days))
    
    stats = cur.fetchone()
    completion_rate = (stats['completed_logs'] / stats['total_logs'] * 100) if stats['total_logs'] > 0 else 0
    
    # Get active streaks
    cur.execute('''
        SELECT COUNT(*) as count FROM streaks s
        JOIN habits h ON s.habit_id = h.id
        WHERE h.user_id = %s AND s.current_streak > 0
    ''', (user_id,))
    active_streaks = cur.fetchone()['count']
    
    cur.close()
    conn.close()
    
    return jsonify({
        'totalHabits': total_habits,
        'completionRate': round(completion_rate, 1),
        'activeStreaks': active_streaks,
        'totalLogs': stats['total_logs'],
        'completedLogs': stats['completed_logs']
    })

# ==================== SYNC ENDPOINT ====================

@app.route('/api/sync', methods=['POST'])
def sync_data():
    """Sync data from client to server"""
    data = request.json
    user_id = data.get('user_id', 'default')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    synced_count = 0
    
    # Sync habits
    for habit in data.get('habits', []):
        if habit.get('syncStatus') == 'pending':
            # Check if exists
            cur.execute('SELECT id FROM habits WHERE id = %s', (habit['id'],))
            exists = cur.fetchone()
            
            if exists:
                # Update
                cur.execute('''
                    UPDATE habits SET
                        name = %s, description = %s, points = %s,
                        updated_at = %s
                    WHERE id = %s
                ''', (habit['name'], habit['description'], 
                      habit['points'], habit['updatedAt'], habit['id']))
            else:
                # Insert (handle client-generated IDs)
                pass
            
            synced_count += 1
    
    # Sync logs
    for log in data.get('logs', []):
        if log.get('syncStatus') == 'pending':
            cur.execute('''
                INSERT INTO habit_logs (habit_id, date, completed, notes, duration, mood)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (habit_id, date) DO UPDATE SET
                    completed = EXCLUDED.completed,
                    notes = EXCLUDED.notes
            ''', (log['habitId'], log['date'], log['completed'],
                  log.get('notes'), log.get('duration'), log.get('mood')))
            synced_count += 1
    
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({
        'message': 'Sync completed',
        'syncedCount': synced_count,
        'timestamp': datetime.now().isoformat()
    })

# ==================== HELPER FUNCTIONS ====================

def update_streak(cur, habit_id, completed_date):
    """Update streak for a habit"""
    cur.execute('SELECT * FROM streaks WHERE habit_id = %s', (habit_id,))
    streak = cur.fetchone()
    
    if not streak:
        return
    
    from datetime import datetime
    last_date = streak['last_completed_date']
    current_date = datetime.strptime(completed_date, '%Y-%m-%d').date()
    
    if last_date:
        days_diff = (current_date - last_date).days
        
        if days_diff == 1:
            # Consecutive day
            new_streak = streak['current_streak'] + 1
        elif days_diff == 0:
            # Same day
            new_streak = streak['current_streak']
        else:
            # Streak broken
            new_streak = 1
    else:
        new_streak = 1
    
    longest_streak = max(new_streak, streak['longest_streak'])
    
    cur.execute('''
        UPDATE streaks SET
            current_streak = %s,
            longest_streak = %s,
            last_completed_date = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE habit_id = %s
    ''', (new_streak, longest_streak, completed_date, habit_id))
    
    # Award bonus points for milestones
    if new_streak % 7 == 0:
        award_points(cur, habit_id, 50)
    if new_streak % 30 == 0:
        award_points(cur, habit_id, 200)

def award_points(cur, habit_id, points):
    """Award points to a habit and user"""
    # Update habit points
    cur.execute('''
        UPDATE habits SET
            points = points + %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    ''', (points, habit_id))
    
    # Update user progress
    cur.execute('SELECT user_id FROM habits WHERE id = %s', (habit_id,))
    result = cur.fetchone()
    if result:
        user_id = result['user_id']
        cur.execute('''
            INSERT INTO user_progress (user_id, total_points, level)
            VALUES (%s, %s, 1)
            ON CONFLICT (user_id) DO UPDATE SET
                total_points = user_progress.total_points + %s,
                level = (user_progress.total_points + %s) / 100 + 1,
                updated_at = CURRENT_TIMESTAMP
        ''', (user_id, points, points, points))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
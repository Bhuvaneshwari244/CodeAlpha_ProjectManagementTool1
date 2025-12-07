// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(__dirname));

// --- Mock Database (In-Memory) ---
let users = []; // Stores user data [cite: 31, 51]
let projects = []; // Stores project boards [cite: 48]
// Structure: { id, name, tasks: [] }
// Task Structure: { id, title, status, assignee, comments: [] }

// --- Routes ---

// 1. User Registration (Simplified Auth) 
app.post('/register', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username required' });
    const user = { id: Date.now(), username };
    users.push(user);
    res.json({ message: 'User registered', user });
});

// 2. Create Project [cite: 48]
app.post('/projects', (req, res) => {
    const { name } = req.body;
    const newProject = { id: Date.now(), name, tasks: [] };
    projects.push(newProject);
    res.json(newProject);
});

// 3. Get All Projects
app.get('/projects', (req, res) => {
    res.json(projects);
});

// 4. Create/Assign Task [cite: 49]
app.post('/projects/:projectId/tasks', (req, res) => {
    const { projectId } = req.params;
    const { title, assignee } = req.body;
    
    const project = projects.find(p => p.id == projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const newTask = {
        id: Date.now(),
        title,
        status: 'To Do', // Default status
        assignee: assignee || 'Unassigned',
        comments: []
    };
    
    project.tasks.push(newTask);
    res.json(newTask);
});

// 5. Add Comment to Task [cite: 50]
app.post('/projects/:projectId/tasks/:taskId/comments', (req, res) => {
    const { projectId, taskId } = req.params;
    const { text, user } = req.body;

    const project = projects.find(p => p.id == projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = project.tasks.find(t => t.id == taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const newComment = { user, text, date: new Date() };
    task.comments.push(newComment);
    res.json(task);
});

// 6. Move Task (Update Status)
app.put('/projects/:projectId/tasks/:taskId/move', (req, res) => {
    const { projectId, taskId } = req.params;
    const { status } = req.body; // 'To Do', 'In Progress', 'Done'

    const project = projects.find(p => p.id == projectId);
    const task = project.tasks.find(t => t.id == taskId);
    
    if (task) {
        task.status = status;
        res.json(task);
    } else {
        res.status(404).json({ error: "Not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
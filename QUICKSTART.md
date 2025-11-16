# 🚀 Quick Start Guide

## ✅ Server is Running!

Your RAJAI Platform is now live and ready to use.

---

## 🌐 Access the Application

**Open your browser and visit:**

```
http://localhost:5001
```

---

## 🎯 What You Can Do Now

### 1. Create Your First Agent

1. Click **"Create Agent"** button
2. Fill in the details:
   - **Name**: Content Writer
   - **Role**: Senior Content Strategist
   - **Goal**: Create engaging, SEO-optimized content
   - **Backstory**: Expert writer with 10 years of experience
   - **Tasks**: 
     - Research trending topics
     - Write 1000-word article
     - Optimize for SEO
3. Click **"Create Agent"**

### 2. Execute the Agent

1. Find your agent in the dashboard
2. Click the **"Execute"** button
3. Watch real-time results appear in the right panel

### 3. View Execution History

1. Click **"View All Executions"** in the header
2. See all past executions
3. Click any execution to view details

---

## 🔗 Available URLs

- **Dashboard**: http://localhost:5001/
- **Agents**: http://localhost:5001/agents
- **Executions**: http://localhost:5001/executions
- **API Health**: http://localhost:5001/api/health

---

## 📊 API Endpoints

Test the API directly:

```bash
# Health check
curl http://localhost:5001/api/health

# List agents
curl http://localhost:5001/api/agents

# Create agent
curl -X POST http://localhost:5001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "role": "Tester",
    "goal": "Test the system",
    "backstory": "A test agent",
    "tasks": ["Test task 1", "Test task 2"]
  }'

# List executions
curl http://localhost:5001/api/executions
```

---

## 🛑 Stop the Server

```bash
# Find the process
ps aux | grep "npm run dev"

# Kill the process
kill <PID>

# Or use pkill
pkill -f "npm run dev"
```

---

## 🔄 Restart the Server

```bash
npm run dev
```

---

## 📝 Server Logs

View real-time logs:

```bash
tail -f server.log
```

View all logs:

```bash
cat server.log
```

---

## ✅ System Status

- ✅ Server: Running on port 5001
- ✅ Database: Connected to Neon PostgreSQL
- ✅ Gemini API: Configured and ready
- ✅ Environment: Development mode
- ✅ CORS: Enabled for localhost
- ✅ Rate Limiting: Disabled in development

---

## 🎨 Features Available

### Dashboard
- Split-pane layout
- Agent management (left)
- Execution results (right)
- Drag-and-drop reordering
- Real-time updates

### Agent Management
- Create agents
- Edit agents
- Delete agents
- Reorder agents
- Execute agents

### Execution Tracking
- View all executions
- Real-time status updates
- Detailed results
- Execution history

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5002
```

### Database Connection Issues

```bash
# Test database connection
npm run db:push

# Check .env file
cat .env
```

### API Key Issues

```bash
# Verify API key in .env
grep GOOGLE_API_KEY .env

# Test API directly
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"
```

---

## 📚 Next Steps

1. ✅ Create multiple agents
2. ✅ Execute agents and see results
3. ✅ Explore the UI features
4. ✅ Test drag-and-drop reordering
5. ✅ View execution history
6. ✅ Deploy to Vercel (see DEPLOYMENT.md)

---

## 🎉 You're All Set!

Your RAJAI Platform is running perfectly. Start creating intelligent AI agents!

**Happy Building! 🚀**

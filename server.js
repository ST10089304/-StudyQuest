require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const { getPool } = require('./config/database');
const { attachUser, requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { showDashboard } = require('./controllers/dashboardController');
const { showProfile } = require('./controllers/profileController');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(attachUser);

app.get('/', (req, res) => res.render('index', { title: 'StudyQuest' }));
app.use(authRoutes);
app.get('/dashboard', requireAuth, showDashboard);
app.use('/tasks', requireAuth, taskRoutes);
app.get('/profile', requireAuth, showProfile);

app.use((req, res) => res.status(404).render('404', { title: 'Page not found' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('500', { title: 'Something went wrong' });
});

getPool()
  .then(() => app.listen(port, () => console.log(`StudyQuest running at http://localhost:${port}`)))
  .catch(error => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });

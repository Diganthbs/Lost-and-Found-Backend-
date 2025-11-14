const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const responsesRoutes = require('./routes/responses');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/responses', responsesRoutes);

// static frontend (optional) - serve the frontend folder by placing it alongside backend
const path = require('path');
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server started on port', PORT));



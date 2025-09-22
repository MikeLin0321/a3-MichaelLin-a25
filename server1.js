require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const { ServerApiVersion, MongoClient } = require('mongodb');
const cookies = require('cookie-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const cookieKey = process.env.KEY ||'secreyKey';
const ObjectId = require('mongodb').ObjectId;

app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.use(cookies({
  name: 'session',
  keys: [cookieKey],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(express.urlencoded({ extended: true }));

const uri = `mongodb+srv://${process.env.USERNM}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });

// Middleware to parse JSON bodies
app.use(express.json());
let users;
// Initialize DB and start server after successful connect
async function init() {
  try {
    await client.connect();
    const db = client.db('Weba3DB');
    users = db.collection('users');
    console.log('✅ Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

init();

process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing MongoDB client...');
  try {
    await client.close();
  } catch (e) {
    console.error('Error closing MongoDB client', e);
  }
  process.exit(0);
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("❌ Unauthorized. Please <a href='/'>login</a>.");
    }
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/register', (req, res) => {
res.sendFile(path.join(__dirname, 'public/register.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const existUser = await users.findOne({ username });
    if (existUser) {
        return res.status(400).send("❌ Username already exists. <a href='/register'>Try again</a>");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
  // create user document with an empty todos array
  const result = await users.insertOne({ username, password: hashedPassword, todos: [] });

  // redirect to login page with a query param to show success hint
  return res.redirect('/login.html');
});

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await users.findOne({ username });
    if (!user) {
      return res.redirect('/');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.redirect('/');
    }
  req.session.user = { id: user._id.toString(), username: user.username };
  return res.redirect('/dashboard');
});

app.post('/logout', (req, res) => {
    req.session = null;
    return res.redirect('/');
});

// Todos endpoints (authenticated)
app.get('/todos', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = await users.findOne({ _id: new ObjectId(req.session.user.id) });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user.todos || []);
});

app.post('/todos', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const { thing, date } = req.body;
  const oid = new ObjectId(req.session.user.id);
  const todoId = new ObjectId().toString();
  const todoItem = { thing, date, done: false, id: todoId };
  console.log(oid);
  const update = await users.findOneAndUpdate(
    { _id: oid },
    { $push: { todos: todoItem} },
    { returnDocument: 'after' }
  );
  result = JSON.stringify(update.todos);
  console.log(result);
  res.writeHead( 200, "OK", {"Content-Type": "text/plain" })
  res.end( result)
});

app.delete('/delete', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.body;
  const oid = new ObjectId(req.session.user.id);
  console.log(oid);
  const update = await users.findOneAndUpdate(
    { _id: oid },
    { $pull: { todos: { id: id } } },
    { returnDocument: 'after' }
  );
  result = JSON.stringify(update.todos);
  console.log("result:" + result);
  res.writeHead( 200, "OK", {"Content-Type": "text/plain" })
  res.end( result)
});

app.post('/done/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const oid = new ObjectId(req.session.user.id);
  console.log(oid);
  const update = await users.findOneAndUpdate(
    { _id: oid, "todos.id": id },
    { $set: { "todos.$.done": true } },
    { returnDocument: 'after' }
  );
  result = JSON.stringify(update.todos);
  console.log("result:" + result);
  res.writeHead( 200, "OK", {"Content-Type": "text/plain" })
  res.end( result)
} );

app.get('/edit', async(req, res) => {
    if (!req.session.user) {
        return res.status(401).send("❌ Unauthorized. Please <a href='/'>login</a>.");
    }
    id = req.query.id;
    todo = await users.findOne(
      { _id: new ObjectId(req.session.user.id), "todos.id": id },
      { projection: { "todos.$": 1 } }
    );
    if (!todo) {
        return res.status(404).send("❌ Todo item not found. <a href='/dashboard'>Go back</a>.");
    }
    if (req.headers.accept?.includes("application/json")) {
    return res.json(todo.todos[0]);
  }

  res.sendFile(path.join(__dirname, 'public/edit.html'));
  })
  
  app.post('/edit/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { thing, date } = req.body;
    const oid = new ObjectId(req.session.user.id);
    console.log(oid);
    const update = await users.findOneAndUpdate(
      { _id: oid, "todos.id": id },
      { $set: { "todos.$.thing": thing, "todos.$.date": date } },
      { returnDocument: 'after' }
    );
    result = JSON.stringify(update.todos);
    console.log("result:" + result);
    res.writeHead( 200, "OK", {"Content-Type": "text/plain" })
    res.end( result)
  } );




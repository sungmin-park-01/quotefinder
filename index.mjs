import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({ extended: true }));

//setting up database connection pool
const pool = mysql.createPool({
    host: "ijj1btjwrd3b7932.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "dzdn2gafpfqugy38",
    password: "ce7qw9hqmw9rojym",
    database: "asxyh5huejclqdub",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', async(req, res) => {
    let sql = `SELECT authorId, firstName, lastName
               FROM authors 
               ORDER BY lastName`;
    const [rows] = await pool.query(sql);

    console.log(rows);           
    res.render('home.ejs' , { rows});
});

// app.get('/searchByKeyword', async (req, res) => {
//     let authorId = req.query.authorId;
//     //write SQL to retrieve quotes by authorId
//     res.render('results.ejs')
// });

// searchByKeyword
app.get('/searchByKeyword', async (req, res) => {
    let keyword = req.query.keyword;

    if (keyword.length < 3) {
        return res.render("results.ejs", {
            keyword,
            error: "Keyword must be at least 3 characters long."
        });
    }

    console.log(keyword);
    let sql = `SELECT authorId, firstName, lastName, quote
               FROM quotes 
               NATURAL JOIN authors 
               WHERE quote LIKE ?`;
    let sqlParams = [`%${keyword}%`];
    const [rows] = await pool.query(sql, sqlParams);
    console.log(rows);
    res.render('results.ejs', { rows, keyword,error: null });
});

app.get('/searchByAuthor', async (req, res) => {
    let userAuthorId = req.query.authorId;
    let sql = `SELECT *
               FROM quotes
               NATURAL JOIN authors
               WHERE authorId = ?`;
    let sqlParams = [userAuthorId];
    const [rows] = await pool.query(sql, sqlParams);
    //console.log(rows);
    res.render("sbaResults.ejs", {rows});
});

// local API to get all info a specific author
app.get('/api/authors/:authorId', async (req, res) => {
    let authorId = req.params.authorId;
    let sql = `SELECT * 
               FROM authors 
               WHERE authorId = ?`;
    const [rows] = await pool.query(sql, [authorId]);
    console.log(rows);
    res.send(rows)
});


app.get('/searchByCategory', async (req, res) => {
  let category = req.query.category;
  console.log(category);
  let sql = `SELECT authorId, firstName, lastName, quote
               FROM quotes
               NATURAL JOIN authors
               WHERE category = ?`;
    let sqlParams = [category];
    const [rows] = await pool.query(sql, sqlParams);
  res.render('sbcResults.ejs', { rows });
});


app.get('/searchByLikes', async(req, res) => {
    let minLikes = parseInt(req.query.minLikes) || 0;
    let maxLikes = parseInt(req.query.maxLikes) || 1000;
    let sql = `SELECT authorId, firstName, lastName , quote , likes
    FROM authors
    NATURAL JOIN quotes
    WHERE likes BETWEEN ? AND ?
    ORDER BY likes DESC`;
    const[rows] = await pool.query(sql, [minLikes, maxLikes]);
    res.render('likes.ejs', {rows, minLikes, maxLikes});
});

app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.listen(3000, () => {
    console.log("Express server running")
})
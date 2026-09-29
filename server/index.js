const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blog"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }
    console.log("MySQL connected successfully");
});

// GET TODOS ROUTE
app.get("/get-todos", (req, res) => {
    const query = "SELECT * FROM todos";
    db.query(query, (err, result) => {
        if (err) {
            console.error("SQL GET ERROR:", err);
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json(result);
    });
});

// POST TODO ROUTE
app.post("/new-todo", (req, res) => {
    const { todo } = req.body;
    if (!todo) {
        return res.status(400).json({ error: "Task cannot be empty" });
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const query = "INSERT INTO todos (task, created, status) VALUES (?, ?, ?)";
  
    db.query(query, [todo, currentDate, 'Active'], (err, result) => {
        if (err) {
            console.error("SQL INSERT ERROR:", err);
            return res.status(500).json({ error: err.message });
        } 
        return res.status(200).json({ success: true, message: "Todo added successfully!" });
    });
});

app.put("/update-todo/:editId", (req, res) => {
    const todoId = req.params.editId;
    const { todo } = req.body;

    if(!todo) {
        return res.status(400).json({ error: "Task cannot be empty"});
    }

    const query = "UPDATE todos SET task = ? WHERE id = ?";
    db.query(query, [todo, todoId], (err, result) => {
        if(err) return res.status(500).json(
            {
                success: false,
                error: err.message
            }
        )
        if(result.affectedRows === 0) return res.status(404).json({ success: false, message: "Todo not found" });
        return res.status(200).json(
            {
                success: true,
                message: "Todo updated successfully."
            }
        )
    })

})

app.delete("/delete-todo/:id", (req, res) => {
    const id = req.params.id;
    if(!id) {
        return res.status(400).json({ error: "Something went wrong."});
    }
    const query = "DELETE FROM todos WHERE id = ?";
    db.query(query, [id], (err, result) => {
        if(err) return res.status(500).json({ success: false, message: "Not able to delte." });
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Todo not found." });
        }
        return res.status(200).json({success: true, message: "Todo deleted successfully.." })
    })
});

app.put("/complete-todo/:id", (req, res) => {
    const id = req.params.id;
    if(!id) {
        return res.status(400).json({ error: "Something went wrong."});
    }
    const query = "UPDATE todos SET status = ? where id = ?";
    db.query(query, ["Compleated", id], (err, result) => {
        if(err) return res.status(500).json({ success: false, message: "Not able update status." });
        if(result.affectedRows === 0) return res.status(404).json({ success: false, message: "Todo not found" });
        return res.status(200).json(
            {
                success: true,
                message: "Todo compleated successfully."
            }
        )
    })
})

app.listen(8800, () => {
  console.log("server started on port 8800");
});
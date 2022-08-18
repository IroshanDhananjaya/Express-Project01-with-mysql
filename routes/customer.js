const express = require('express')
const router = express.Router()
const mysql=require('mysql')
const db=require('../configs/db.configs')


const connection=mysql.createConnection(db.database);

connection.connect(function (err){
    if(err){
        console.log(err)
    }else {
        var customerTableQuery="CREATE TABLE IF NOT EXISTS customer(id VARCHAR (255) PRIMARY KEY ,name VARCHAR (255),address VARCHAR (255))"
        connection.query(customerTableQuery,function (err,result){
            if(result.warningCount === 0){
                console.log("Customer table created!");
            }
        })
    }
})


router.get('/', (req, res) => {
    var query="SELECT * FROM customer"
    connection.query(query,(err,rows)=>{
        res.send(rows);
    })
});

router.post('/',(req,res)=>{
    const id=req.body.id;
    const name=req.body.name;
    const address=req.body.address;

    var query="INSERT INTO customer (id,name,address)VALUES (?,?,?)";

    connection.query(query,[id,name,address],(err)=>{
        if (err) {
            res.send({ 'message': 'duplicate entry' })
        } else {
            res.send({ 'message': 'Customer created!' })
        }
    })


});

router.put('/',(req,res)=>{
    const id=req.body.id;
    const name=req.body.name;
    const address=req.body.address;

    var query = "UPDATE customer SET name=?, address=? WHERE id=?";
    connection.query(query, [name, address, id], (err, rows) => {
        if (err) console.log(err);

        if (rows.affectedRows > 0) {
            res.send({ 'message': 'customer updated' })
        } else {
            res.send({ 'message': 'customer not found' })
        }
        // res.send(rows)
    })
})

router.delete('/:id', (req, res) => {
    const id = req.params.id

    var query = "DELETE FROM customer WHERE id=?";

    connection.query(query, [id], (err, rows) => {
        if (err) console.log(err);

        if (rows.affectedRows > 0) {
            res.send({ 'message': 'customer deleted' })
        } else {
            res.send({ 'message': 'customer not found' })
        }
    })
})
router.get('/:id', (req, res) => {
    const id = req.params.id

    var query = "SELECT * from customer WHERE id=?";

    connection.query(query, [id], (err, row) => {
        if(err) console.log(err);

        res.send(row)
    })
})


module.exports = router
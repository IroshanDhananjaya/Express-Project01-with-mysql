const express = require("express")
const mysql = require("mysql")
const db = require("../configs/db.configs")

const connection = mysql.createConnection(db.database)
connection.connect(function (err) {
    if (err) {
        console.log(err)
    } else {
        var orderTableQuery = "CREATE TABLE IF NOT EXISTS orders(oId VARCHAR (7),date DATE,\n" +
            "    customerId VARCHAR (7),\n" +
            "    cost DECIMAL (10,2) DEFAULT 0.00,\n" +
            "    CONSTRAINT PRIMARY KEY (oId),\n" +
            "    CONSTRAINT FOREIGN KEY (customerId) REFERENCES customer(id) ON DELETE CASCADE ON UPDATE CASCADE)";

        connection.query(orderTableQuery, function (err, result) {
            if (result.warningCount === 0) {
                console.log("Order Table Create")
            }
        })

        var orderDetailTableQuery = "CREATE TABLE IF NOT EXISTS orderDetail(orderId VARCHAR (7),itemId VARCHAR (7)," +
            "qty INT,price DECIMAL (10,2) DEFAULT 0.00,CONSTRAINT PRIMARY KEY (orderId,itemId)," +
            "CONSTRAINT FOREIGN KEY (orderId) REFERENCES orders(oId) ON DELETE CASCADE ON UPDATE CASCADE," +
            "CONSTRAINT FOREIGN KEY (itemId) REFERENCES item(id) ON DELETE CASCADE ON UPDATE CASCADE)";

        connection.query(orderDetailTableQuery, function (err, result) {
            if (result.warningCount === 0) {
                console.log("Order Detail Table Create")
            }
        })
    }
})

const router = express.Router()


router.post("/", (req, res) => {
    const oId = req.body.orderId
    const date = req.body.date
    const customerId = req.body.customerId
    const cost = req.body.cost

    const orderDetail = req.body.orderDetail;


    var orderPostQuery = "INSERT INTO orders (OId,date ,customerId,cost) VALUES (?,?,?,?)"

    connection.query(orderPostQuery, [oId, date, customerId, cost], (err) => {
        if (err) {
            console.log(err)
            res.send({"message": "Order Placing Failed"})
        } else {
            if (saveOrderDetail(res, orderDetail,oId)) {
                res.send({"message": "Order Placing Successfully"})
            }else {
                res.send({"message": "Order Placing Failed"})
            }
        }
    })
})

function saveOrderDetail(res, orderDetail,oid) {
    var orderDetailPostQuery = "INSERT INTO orderDetail (orderId,itemId ,qty,price) VALUES (?,?,?,?)"

    for (const orderDetailKey of orderDetail) {
        connection.query(orderDetailPostQuery, [oid, orderDetailKey.itemId, orderDetailKey.qty, orderDetailKey.total], (err) => {
            if (err) {
                console.log(err)
                return false;
            } else {
                if (updateItem(orderDetailKey.qty, orderDetailKey.itemId)) {

                }else {
                    return false;
                }
            }
        })
    }
    return true;
}

function updateItem(qty,itemId) {
    var itemUpdateQuery = "UPDATE item SET qty=? WHERE id=?"

    var getQuery = "SELECT * FROM item WHERE id=?"
    connection.query(getQuery, [itemId], (err, row) => {
        if (err) {
            console.log(err)
        }

        var currentQty=(+row[0].qty)-(+qty);

        connection.query(itemUpdateQuery, [currentQty,itemId], (err) => {
            if (err) {
                console.log(err)
                return false
            } else {
                return true;
            }
        })
    })
}

router.delete("/:id", (req, res) => {
    var oId = req.params.id

    var deleteQuery = "DELETE FROM orders WHERE oId=?";
    connection.query(deleteQuery, [oId], (err, rows) => {
        if (err) {
            console.log(err)
        }
        if (rows.affectedRows > 0) {
            res.send({"message": "Order Deleted Successfully"})
        } else {
            res.send({"message": "Order Not Found"})
        }
    })
})

router.get("/", (req, res) => {
    var getQuery = "SELECT * FROM orders"
    connection.query(getQuery, (err, rows) => {
        if (err) console.log(err)
        res.send(rows)
    })
})

router.get("/getOrderDetail/:id", (req, res) => {
    var id=req.params.id

    var getQuery = "SELECT * FROM orderDetail WHERE orderId=?"
    connection.query(getQuery,[id], (err, rows) => {
        if (err) console.log(err)
        res.send(rows)
    })
})


module.exports = router
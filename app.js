const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

//this is for the CORS Policy to allow connections from different origin
app.use(cors());

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "ericsergio",
    password: "password",
    database: "sodb",
});

db.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log("MySql Connected...");
});

function Invoice(balance /*,items = []*/) {
    this.balance = balance;
    //this.items = items;
    //this.date = date;
}

var incrementor = 0;
/*
Creates a temporary table that will hold all order items for one particular order. Out of stock table also
created because the data that gets sent back is what is available and what is not with a invoice for what 
was on the order.
*/
app.get("/createordertable", (req, res) => {
    incrementor++;
    console.log(`createordertable : incrementor value: ${incrementor}`);
    let sql_drop_outofstock_tbl = "DROP TABLE IF EXISTS outOfStockTbl";
    db.query(sql_drop_outofstock_tbl, (err, result) => {
        if (err) throw err;
        //console.log(`createordertable : after drop outOfStockTbl result :${result}`);
    });
    let sql_drop_order_tbl = "DROP TABLE IF EXISTS orderTbl";
    db.query(sql_drop_order_tbl, (err, result) => {
        if (err) throw err;
        //console.log(`createordertable : after drop orderTbl result :${result}`);
    });
    //-------------
    let sql_create_outofstock_tbl =
        "CREATE TABLE outOfStockTbl(id INT NOT NULL AUTO_INCREMENT, itemId INT, itemName VARCHAR(130), PRIMARY KEY(id))";
    db.query(sql_create_outofstock_tbl, (err, result) => {
        if (err) throw err;
        //console.log(`createordertable : after create outOfStock result :${result}`);
    });
    //------------
    let sql_create_order_tbl =
        "CREATE TABLE orderTbl(id INT NOT NULL AUTO_INCREMENT, itemId int, itemName VARCHAR(130), \
    itemPrice DECIMAL(5,2), PRIMARY KEY(id))";
    db.query(sql_create_order_tbl, (err, result) => {
        if (err) throw err;
        //console.log(`createordertable : after create orderTbl result :${result}`);
        res.send("temporary order table successfully created...");
    });
});

/*
Calculates the invoice total for the order by running a SQL query SUM on the temporary order table
*/
app.get("/total", (req, res) => {
    incrementor++;
    console.log(`total : incrementor value: ${incrementor}`);
    let sql_sum_price = `SELECT SUM(itemPrice) FROM orderTbl WHERE id > 0`;
    db.query(sql_sum_price, (err, result) => {
        if (err) throw err;
        //console.log(`total result :${result}`);
        res.send(result);
    });
});

/*

*/
app.get("/instock", (req, res) => {
    incrementor++;
    console.log(`instock : incrementor value: ${incrementor}`);
    let sql_select_in_stock = `SELECT * FROM orderTbl`;
    db.query(sql_select_in_stock, (err, result) => {
        if (err) throw err;
        //console.log(`instock result :${result}`);
        res.send(result);
    });
});

app.get("/outofstock", (req, res) => {
    incrementor++;
    console.log(`outofstock : incrementor value: ${incrementor}`);
    let sql_select_out_stock = `SELECT * FROM outOfStockTbl`;
    db.query(sql_select_out_stock, (err, result) => {
        if (err) throw err;
        //console.log(`outofstock result :${result}`);
        res.send(result);
    });
});

app.get("/getitems/:id", (req, res) => {
    incrementor++;
    console.log(`getitems : incrementor value: ${incrementor}`);
    //console.log(`--------------------------------------------------------------${req.params.id}`);
    let sql_select_by_id = `SELECT * FROM Inventory WHERE id = '${req.params.id}'`;

    db.query(sql_select_by_id, (err, results) => {
        if (err) throw err;
        var o = JSON.stringify(results);
        let oItems = o.split(",");
        var itemId = req.params.id;
        var sku = oItems[1].substring(6);
        var name = oItems[2].substring(7);
        var price = Number(oItems[3].substring(8).replace(/"/gi, ""));
        var quantity = Number(oItems[4].substring(11));
        var type = Number(oItems[5].substring(7));
        var discount = oItems[6].substring(11).replace(/"/gi, "");

        //console.log(`${itemId}, ${sku}, ${name}, ${price}, ${quantity}, ${type}, ${discount}`);

        if (quantity < 1) {
            let sql_insert_order_tbl = `INSERT INTO outOfStockTbl(itemId, itemName) VALUES(${itemId}, ${name})`;
            db.query(sql_insert_order_tbl, (err, results) => {
                if (err) throw err;
            });
        }
        if (quantity > 0) {
            let sql_insert_order_tbl = `INSERT INTO orderTbl(itemId, itemName, itemPrice) VALUES(${itemId}, ${name}, ${price})`;
            db.query(sql_insert_order_tbl, (err, results) => {
                if (err) throw err;
            });
            res.send(o);
            let sql_update_new_quantity_val = `UPDATE Inventory SET quantity = ${
                quantity - 1
            } WHERE id = ${req.params.id}`;
            db.query(sql_update_new_quantity_val, (err, results) => {
                if (err) throw err;
                let QuantityLeftMsg = `After this transaction we will have ${
                    quantity - 1
                } left in stock`;
                //console.log(QuantityLeftMsg);
            });
        }
    });
});


app.get("/", (req, res) => {
    console.log("hello world");
    res.send([1, 2, 3]);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));

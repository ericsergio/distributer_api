const express = require('express');
const mysql = require('mysql2');
const app = express();

//this is for the CORS Policy to allow connections from different origin
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

const db = mysql.createConnection({
    host:'127.0.0.1',
    user:'ericsergio',
    password:'password',
    database:'sodb'
});

db.connect(function(err){
    if(err) {
        throw err;
    }
    console.log('MySql Connected...');
});


function Invoice(balance /*,items = []*/){
    this.balance = balance;
    //this.items = items;
    //this.date = date;
}

app.get('/createordertable', (req,res) => {
    let sql_drop_outofstock_tbl = 'DROP TABLE IF EXISTS outOfStockTbl';
    db.query(sql_drop_outofstock_tbl, (err, result) => {
        if(err) throw err;
        console.log(result);        
    });
    let sql_drop_order_tbl = 'DROP TABLE IF EXISTS orderTbl';
    db.query(sql_drop_order_tbl, (err, result) => {
        if(err) throw err;
        console.log(result);        
    });
    //-------------
    let sql_create_outofstock_tbl = 'CREATE TABLE outOfStockTbl(id INT NOT NULL AUTO_INCREMENT, itemId INT, itemName VARCHAR(130), PRIMARY KEY(id))';
    db.query(sql_create_outofstock_tbl, (err, result) => {
        if(err) throw err;
        console.log(result);
    });
    //------------
    let sql_create_order_tbl = 'CREATE TABLE orderTbl(id INT NOT NULL AUTO_INCREMENT, itemId int, itemName VARCHAR(130), \
    itemPrice DECIMAL(5,2), PRIMARY KEY(id))';
    db.query(sql_create_order_tbl, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('temporary order table successfully created...')
    });
});
//;

app.get('/total', (req,res) => {
    let sql_sum_price = `SELECT SUM(itemPrice) FROM orderTbl WHERE id > 0`;
    db.query(sql_sum_price, (err, result) => {
        if(err) throw err;
        console.log(result);
        //var o = JSON.stringify(result).split(":");
        //var response = o.replace(/}]/gi,'');
        //var responseMsg = `The order's total comes out to ${response}`;
        res.send(result);
    });
});

app.get('/outofstock', (req,res) => {
    let sql_sum_price = `SELECT * FROM outOfStockTbl`;
    db.query(sql_sum_price, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.get('/getitems/:id', (req, res) => {
    //console.log(`--------------------------------------------------------------${req.params.id}`);
    let sql_select_by_id = `SELECT * FROM Inventory WHERE id = '${req.params.id}'`;

    db.query(sql_select_by_id, (err, results) => {
        if(err) throw err;
        var o = JSON.stringify(results);
        let oItems = o.split(',');
        var itemId = req.params.id;
        var sku = oItems[1].substring(6);
        var name = oItems[2].substring(7);
        var price = Number(oItems[3].substring(8).replace(/"/gi, ''));
        var quantity = Number(oItems[4].substring(11));
        var type = Number(oItems[5].substring(7));
        var discount = (oItems[6].substring(11).replace(/"/gi, ''));
    
        console.log(`${itemId}, ${sku}, ${name}, ${price}, ${quantity}, ${type}, ${discount}`);
        var msg = `${name} ${price}`
        
        if (quantity < 1){
            let sql_insert_order_tbl = `INSERT INTO outOfStockTbl(itemId, itemName) VALUES(${itemId}, ${name})`;
            db.query(sql_insert_order_tbl, (err, results) => {
                if(err) throw err;
            })
        }
        if(quantity > 0) {
            let sql_insert_order_tbl = `INSERT INTO orderTbl(itemId, itemName, itemPrice) VALUES(${itemId}, ${name}, ${price})`;
            db.query(sql_insert_order_tbl, (err, results) => {
                if(err) throw err;
            })
        }
        res.send(o);
    });
});
        
        
        
        //let sql3 = `UPDATE Inventory SET quantity = ${quantity - 1} WHERE id = ${req.params.id}`;
        //let query3 = db.query(sql3, (err, results) => {
        //    if(err) throw err;
        //    let QuantityLeftMsg = `After this transaction we will have ${quantity - 1} left in stock`;
            //console.log(QuantityLeftMsg);
        //})
        //let query4 = db.query(sql3, (err, results) => {
            //if(err) throw err;
            //var o = JSON.stringify(results);
            //let oItems = o.split(':');
            //let total = oItems[1].substring(1).replace(/"}]/gi, '');
            //console.log(total);
            //Invoice.lastRun = new Invoice(total);
            //console.log(Invoice.lastRun.balance)
            //res.send(Invoice.lastRun.balance + itemResults)
            //res.send(Invoice.lastRun.balance)
        //})



//let sql1 = `CREATE TABLE orderTbl(id INT NOT NULL AUTO_INCREMENT, itemId int, itemName VARCHAR(30), 
//itemPrice VARCHAR(30), PRIMARY KEY(id))`;
    //let query = db.query(sql1, (err, results) => {
    //    if(err) throw err;



app.get('/', (req, res) => {
    res.send([1,2,3]);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));
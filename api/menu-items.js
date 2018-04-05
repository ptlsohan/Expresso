const express = require('express');
const menuItemRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuItemRouter.param('menuItemId',(req,res,next,id) => {
  const sql='SELECT * FROM MenuItem WHERE id = $id';
  const values = {$id : id};
  db.get(sql,values,(err,menuItem) => {
    if(err){
      next(err);
    }
    else if (menuItem) {
      req.menuItem = menuItem;
      next();
    }
    else {
      res.sendStatus(404);
    }
  });
});


menuItemRouter.get('/',(req,res,next) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menu_id';
  const value = {$menu_id: req.menu.id};
  console.log(req.menu.id);
  db.all(sql, value, (err, rows) => {
    if(err){
      next(err);
    }
    else if (rows) {
      res.status(200).json({menuItems : rows});
    }
  });
});


menuItemRouter.post('/',(req,res,next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description !==null? req.body.menuItem.description : "" ;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  if(!name || !inventory || !price ){
    return res.sendStatus(400);
  }
  const sql='INSERT INTO MenuItem (name,description,inventory,price,menu_id) VALUES ($name,$description,$inventory,$price,$menu_id)';
  const values = {
    $name : name,
    $description : description,
    $inventory : inventory,
    $price : price,
    $menu_id : req.menu.id
  };
  db.run(sql, values, function(err){
    if(err){
      next(err);
    }
    else{
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (err,row) => {
        res.status(201).json({menuItem : row});
      });
    }
  });
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description !==null? req.body.menuItem.description : "" ;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  if(!name || !inventory || !price ){
    return res.sendStatus(400);
  }

  const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
      'inventory = $inventory, price = $price ' +
      'WHERE MenuItem.id = $menuItemId';
      const values = {
        $name : name,
        $description : description,
        $inventory : inventory,
        $price : price,
        $menuItemId : req.params.menuItemId
      };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (error, menuItem) => {
          res.status(200).json({menuItem: menuItem});
        });
    }
  });
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {$menuItemId: req.params.menuItemId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
          res.sendStatus(204);
    }
  });
});

module.exports = menuItemRouter;

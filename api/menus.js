const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemRouter = require('./menu-items.js');


menuRouter.param('menuId',(req,res,next,id) => {
  const sql='SELECT * FROM Menu WHERE id = $id';
  const values = {$id : id};
  db.get(sql,values,(err,menu) => {
    if(err){
      next(err);
    }
    else if (menu) {
      req.menu = menu;
      next();
    }
    else {
      res.sendStatus(404);
    }
  });
});
menuRouter.use('/:menuId/menu-items',menuItemRouter);

menuRouter.get('/',(req,res,next) => {
  const sql = 'SELECT * FROM Menu';
  db.all(sql, (err, rows) => {
    if(err){
      next(err);
    }
    else if (rows) {
      res.status(200).json({menus: rows});
    }
  });
});

menuRouter.get('/:menuId', (req,res,next) => {
  res.status(200).json({menu:req.menu});
});

menuRouter.post('/',(req,res,next) => {
  const title = req.body.menu.title;
  if(!title){
    return res.sendStatus(400);
  }
  const sql='INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title : title
  };
  db.run(sql,values, function(err){
    if(err){
      next(err);
    }
    else{
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err,menu) => {
        res.status(201).json({menu: menu});
      });
    }
  });
});

menuRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title ' +
      'WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.menu.id
  };

  db.run(sql, values, function(error){
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, row) => {
          res.status(200).json({menu : row});
        });
    }
  });
});

menuRouter.delete('/:menuId', (req, res, next) => {
  const itemsql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const itemValues = {$menuId: req.params.menuId};
  db.get(itemsql, itemValues, (error, item) => {
    if (error) {
      next(error);
    } else if (item) {
      res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const deleteValues = {$menuId: req.params.menuId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = menuRouter;

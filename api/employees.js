const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets.js');


employeesRouter.param('employeeId',(req,res,next,id) => {
  const sql='SELECT * FROM Employee WHERE id = $id';
  const values = {$id : id};
  db.get(sql,values,(err,employee) => {
    if(err){
      next(err);
    }
    else if (employee) {
      req.employee = employee;
      next();
    }
    else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets',timesheetsRouter);
employeesRouter.get('/',(req,res,next) => {
  const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
  db.all(sql, (err, rows) => {
    if(err){
      next(err);
    }
    else if (rows) {
      res.status(200).json({employees: rows});
    }
  });
});

employeesRouter.get('/:employeeId', (req,res,next) => {
  res.status(200).json({employee:req.employee});
});

employeesRouter.post('/',(req,res,next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  //const is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
  if(!name || !position || !wage){
    return res.sendStatus(400);
  }
  const sql='INSERT INTO Employee (name,position,wage) VALUES ($name,$position,$wage)';
  const values = {
    $name : name,
    $position : position,
    $wage : wage
  };
  db.run(sql,values, function(error){
    if(error){
      next(error);
    }
    else{
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (error, row) => {
        console.log(JSON.stringify(row));
        res.status(201).json({employee : row});
      });
    }
  });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
      'wage = $wage, is_current_employee = $is_current_employee ' +
      'WHERE Employee.id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $is_current_employee: is_current_employee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
  const values = {$employeeId: req.params.employeeId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

module.exports = employeesRouter;

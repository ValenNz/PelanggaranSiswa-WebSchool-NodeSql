const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const db = require("../config")
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.post("/", (req,res) => {
    
    let data = {
        nama_pelanggaran : req.body.nama_pelanggaran,
        poin: req.body.poin
    }

    let sql = "insert into pelanggaran set ?"
    db.query(sql, data, (err, result) => {
        if(err) {
            response = {
                message: err.message
            }
        } else {
            response = {
                message: result.affectedRows + " Data pelanggaran berhasil ditambahkan"
            }
        }
        res.json(response)
    })
})

app.get("/", (req, res) => {
    
    let sql = "select * from pelanggaran"

    db.query(sql, (err, result) => {
        if(err){
            response = {
                message: err.message
            }
        } else {
           response = {
                count: result.length,
                pelanggaran : result
           }
        }
        res.json(response)
    })
})

app.get("/:id_pelanggaran", (req,res) => {
    let data = {
        id_pelanggaran: req.params.id_pelanggaran
    }

    let sql = "select * from pelanggaran where ?" 

    db.query(sql, data, (err, result) => {
        if(err){
            response = {
                message: err.message
            }
        } else {
            response = {
                count: result.length,
                pelanggaran: result
            }
        }
        res.json(response)
    })

})

app.put("/:id_pelanggaran", (req,res) => {
    let data = [
        {
           nama_pelanggaran: req.body.nama_pelanggaran,
           poin: req.body.poin
        },
        {
            id_pelanggaran: req.params.id_pelanggaran
        }
    ]

    let sql = "update pelanggaran set ? where ?"

    db.query(sql, data, (err, result) => {
        if(err) {
            response = {
                message: err.message,
            }
        } else {
            response = {    
                mesaage: result.affectedRows + " Data pelanggaran berhasil di update"
            }
        }
        res.json(response)
    })
})

app.delete("/:id_pelanggaran", (req,res) => {
    let data = {
        id_pelanggaran : req.params.id_pelanggaran
    }

    let sql = "delete from pelanggaran where ? "

    db.query(sql, data, (err, result) => {
        if(err){
            response = {
                message : err.message   
            }
           
        } else {
            response = {
                message  : result.affectedRows + " Data berhasil di hapus"
            }
        }
        res.json(response)
    })
})


module.exports = app
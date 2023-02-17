const express = require("express")         
const bodyParser = require("body-parser")   
const cors = require("cors")                
const db = require("../config")            
const multer = require("multer")           
const path = require("path")                
const fs = require("fs")                   

const app = express()                          
app.use(cors())                                 
app.use(bodyParser.json())                         
app.use(bodyParser.urlencoded({extended: true}))  
app.use(express.static(__dirname));           

/* Make Function Storage */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './controllers/image/foto_siswa');
    },
    filename: (req, file, cb) => {         
        cb(null, "siswa - "+ Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({storage: storage})

/* Endpoint Create */
app.post("/", upload.single("foto"), (req,res) => {

    let data = {
        nis: req.body.nis,                 
        nama_siswa: req.body.nama_siswa,
        kelas: req.body.kelas,
        poin: req.body.poin,
        foto: req.file.filename
    }

    if(!req.file){
        res.json({
            message: "Tidak ada foto yang dikirim"
        })
    } else {
        let sql = "insert into siswa set ?" 

        db.query(sql, data, (err, result) => {
            if(err) throw err
            res.json({
                message: result.affectedRows+ "Data siswa berhasil ditambahkan"
            })
        })
    }
})

/* Endpoint READ */
app.get("/", (req, res) => {
    let sql = "select * from siswa" 

    db.query(sql, (err, result) => {  
        let response = null    
        if (err) {
            response = {
                message: err.message 
            }            
        } else {
            response = {
                count: result.length,
                siswa: result 
            }            
        }
        res.json(response) 
    })
})

/* Endpoint Detail */
app.get("/:id", (req, res) => { 
    let data = {
        id_siswa: req.params.id 
    }
    let sql = "select * from siswa where ?" 

    db.query(sql, data, (err, result) => {
        let response = null    
        if (err) {                   
            response = {    
                message: err.message 
            }            
        } else {    
            response = {
                count: result.length, 
                siswa: result 
            }            
        }
        res.json(response) 
    })
})

app.put("/:id", upload.single("foto"), (req,res) => {

     let data = null, sql = null
    let param = {
        id_siswa: req.params.id
    }

    if(!req.file){
          data = {
            nis: req.body.nis   ,
            nama_siswa: req.body.nama_siswa,
            kelas: req.body.kelas,
            poin: req.body.poin
        }
    } else {
        data = {
            nis: req.body.nis   ,
            nama_siswa: req.body.nama_siswa,
            kelas: req.body.kelas,
            poin: req.body.poin,
            foto: req.file.filename
        }

        sql = "select * from siswa where ?"
        db.query(sql, param, (err, result) => {
            if (err) throw err
            let fileName = result[0].foto

            let dir = path.join(__dirname,"image/foto_siswa",fileName) 
            fs.unlink(dir, (err) => {}) 
        })

    }

    sql = "update siswa set ? where ?"

    db.query(sql, [data,param], (err, result) => {
        if (err) {
            res.json({
                message: err.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data siswa berhasil di updated"
            })
        }
    })
   
})


app.delete("/:id", (req,res) => {
    let data = {
        id_siswa: req.params.id
    }

    let sql = "delete from siswa where ?"

    db.query(sql, data, (err, result) => {
        let response = null
        if (err) {
            response = {
                message: err.message 
            }
        } else {
            response = {
                message: result.affectedRows + " data siswa berhasil dihapus    "
            }
        }
        res.json(response) 
    })
})

module.exports = app 

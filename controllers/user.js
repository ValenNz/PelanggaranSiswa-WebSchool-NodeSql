const express = require("express")          
const bodyParser = require("body-parser")   
const cors = require("cors")              
const db = require("../config")           
const md5 = require("md5")                
const Cryptr = require("cryptr")
const crypt = new Cryptr("140533602676")   
const multer = require("multer")          
const path = require("path")              
const fs = require("fs")

const app = express()                              
app.use(cors())                                   
app.use(bodyParser.json())                         
app.use(bodyParser.urlencoded({extended: true}))  
app.use(express.static(__dirname));     

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './controllers/image/foto_user'); 
    },
    filename: (req, file, cb) => {         
        cb(null, "user-"+ Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({storage: storage})

app.post("/register", upload.single("foto"), (req,res) => {
    let data = {
        email: req.body.email,
        username: req.body.username,
        password: md5(req.body.password),
        foto: req.file.filename
    }

    if(!req.file){
        res.json({
            message: "Tidak ada foto yang dikirim"
        })
    } else {
        let sql = "insert into user set ?" 

        db.query(sql, data, (error, result) => {
            if(error) throw error
            res.json({
                message: result.affectedRows+ "Data user berhasil ditambahkan"
            })
        })
    }
})

app.post("/login", (req, res) => {
    let param = [
        req.body.username, 
        md5(req.body.password) 
    ]
    
    let sql = "select * from user where username = ? and password = ?"

    db.query(sql, param, (error, result) => {
        if (error) throw error 

        if (result.length > 0) {       
            res.json({  
                message: "Berhasil Login",                  
                token: crypt.encrypt(result[0].id_user),   
                data: result                               
            })
        } else { 
            res.json({
                message: "username dan password tidak valid" 
            })
        }
    })
})

app.get("/", (req, res) => {
   let sql = "select * from user" 

   db.query(sql, (error, result) => {  
       let response = null    
       if (error) {
           response = {
               message: error.message 
           }            
       } else {
           response = {
               count: result.length, 
               user: result 
           }            
       }
       res.json(response) 
   })
})

app.get("/:id", (req, res) => { 
   let data = {
       id_user: req.params.id
   }
   let sql = "select * from user where ?" 


   db.query(sql, data, (error, result) => {
       let response = null    
       if (error) {                  
           response = {    
               message: error.message 
           }            
       } else {    
           response = {
               count: result.length, 
               user: result 
           }            
       }
       res.json(response) 
   })
})

app.put("/:id", upload.single("foto"), (req,res) => {

   let data = null, sql = null

   let param = {
       id_user: req.params.id
   }

   if (!req.file) {
       data = {
            email: req.body.email,
            username: req.body.username,
            password: md5(req.body.password),
       }
   } else {
       data = {
            email: req.body.email,
            username: req.body.username,
            password: md5(req.body.password),
            foto: req.file.filename
       }

       sql = "select * from user where ?"

       db.query(sql, param, (err, result) => {
           if (err) throw err
           let fileName = result[0].foto

           let dir = path.join(__dirname,"image/foto_user",fileName) // tangkap penyimpanan
           fs.unlink(dir, (error) => {})   // hapus data
       })

   }

   sql = "update user set ? where ?"

   db.query(sql, [data,param], (error, result) => {
       if (error) {
           res.json({
               message: error.message
           })
       } else {
           res.json({
               message: result.affectedRows + " data user berhasil di updated" // tampilkan pesan
           })
       }
   })
})

app.delete("/:id", (req,res) => {
   let data = {
       id_user: req.params.id
   }

   let sql = "delete from user where ?"

   db.query(sql, data, (error, result) => {
       let response = null
       if (error) {
           response = {
               message: error.message 
           }
       } else {
           response = {
               message: result.affectedRows + " data user berhasil dihapus    "
           }
       }
       res.json(response) 
   })
})

module.exports = app       

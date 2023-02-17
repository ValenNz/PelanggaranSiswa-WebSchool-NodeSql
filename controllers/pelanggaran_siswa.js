const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const moment = require("moment")
const db = require("../config")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

app.post("/", (req,res) => {
    let data = {
        id_siswa : req.body.id_siswa,
        id_user : req.body.id_user,
        waktu : moment().format('YYY-MM-DD HH:mm:ss')
    }

    let pelanggaran = JSON.parse(req.body.pelanggaran)

    let sql = "insert into pelanggaran_siswa set ?"

    db.query(sql, data, (err, result) => {
        if(err){
            res.json({message: err.message})
        } else {
            let lastID = result.insertId

            let data = []

            for (let i = 0; i < pelanggaran.length; i++){
                data.push([
                    lastID, pelanggaran[i].id_pelanggaran
                ])
            }

            let sql = "insert into detail_pelanggaran_siswa values ?"
            db.query(sql, [data], (err, result) => {
                if(err) {
                    res.json({message: err.message})
                } else {
                    res.json({
                        message: " Data apelanggaran berhasil ditambahkan",
                        pelanggaran_siswa : result
                })
                }
            }) 
        }
    })
})

/* Mohon jelaskan */
app.get("/", (req,res) => {
    let sql = "select p.id_pelanggaran_siswa, p.id_siswa, p.waktu, s.nis, s.nama_siswa, p.id_user, u.username " + "from pelanggaran_siswa p join siswa s on p.id_siswa = s.id_siswa " +
     "join user u on p.id_user = u.id_user"

    db.query(sql, (err, result) => {
        if(err){
            res.json({message: err.message})
        } else {
            res.json({
                count: result.length,
                pelanggaran_siswa: result
            })
        }
    })
})

/* Mohon jelaskan */
app.get("/:id_pelanggaran_siswa", (req,res) => {
    let param = { 
        id_pelanggaran_siswa: req.params.id_pelanggaran_siswa
    }

    let sql = "select p.nama_pelanggaran, p.poin " + "from detail_pelanggaran_siswa dps join pelanggaran p "+  "on p.id_pelanggaran = dps.id_pelanggaran " + "where ?"

    db.query(sql, param, (err, result) => {
        if (err) {
            res.json({ message: err.message})   
        }else{
            res.json({
                count: result.length,
                detail_pelanggaran_siswa: result
            })
        }
    })
})

app.delete("/:id_pelanggaran_siswa", (req, res) => {
    let param = { 
        id_pelanggaran_siswa: req.params.id_pelanggaran_siswa}

    // create sql query delete detail_pelanggaran
    let sql = "delete from detail_pelanggaran_siswa where ?"

    db.query(sql, param, (err, result) => {
        if (err) {
            res.json({ message: err.message})
        } else {
            let param = { id_pelanggaran_siswa: req.params.id_pelanggaran_siswa}
            // create sql query delete pelanggaran_siswa
            let sql = "delete from pelanggaran_siswa where ?"

            db.query(sql, param, (err, result) => {
                if (err) {
                    res.json({ message: err.message})
                } else {
                    res.json({message: " Data pelangagran siswa berhasil dihapus"})
                }
            })
        }
    })

})

module.exports = app
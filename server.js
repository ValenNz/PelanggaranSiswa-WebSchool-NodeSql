const express = require('express')
const app = express()
const Cryptr = require("cryptr")            
const crypt = new Cryptr("140533602676") 
const db = require("./config")


const user = require("./controllers/user")
app.use('/user', user)

validateToken = () => {
    return (req, res, next) => {
        // cek keberadaan "Token" pada request header
        if (!req.get("Token")) {
            // jika "Token" tidak ada
            res.json({
                message: "Access Forbidden"
            })
        } else {
            // tampung nilai Token
            let token  = req.get("Token")
            
            // decrypt token menjadi id_user
            let decryptToken = crypt.decrypt(token)

            // sql cek id_user
            let sql = "select * from user where ?"

            // set parameter
            let param = { id_user: decryptToken}

            // run query
            db.query(sql, param, (error, result) => {
                if (error) throw error
                 // cek keberadaan id_user
                if (result.length > 0) {
                    // id_user tersedia
                    next()
                } else {
                    // jika user tidak tersedia
                    res.json({
                        message: "Invalid Token"
                    })
                }
            })
        }

    }
}

const siswa = require("./controllers/siswa")
app.use('/siswa',validateToken(), siswa)

const pelanggaran = require("./controllers/pelanggaran")
app.use("/pelanggaran", pelanggaran)

const pelanggaran_siswa = require("./controllers/pelanggaran_siswa")
app.use("/pelanggaran_siswa",validateToken(), pelanggaran_siswa)

app.listen(8000, () => {
    console.log("Project berjalan di port 8000")
})


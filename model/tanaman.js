const mongoose = require('mongoose')
const Tanaman = mongoose.model('Tanaman', {
  kode: {
    type: String,
    required: true
  },
  nama: String,
  keterangan: String
})

module.exports = Tanaman

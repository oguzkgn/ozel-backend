require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const Note = require('./models/Note');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB veritabanına bağlanıldı.'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Cloudinary Ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer-Cloudinary Storage Ayarları
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'notlar_fotograflar', // Cloudinary'de oluşturulacak klasör
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// Rotalar

// GET /api/notlar - Tüm notları getir
app.get('/api/notlar', async (req, res) => {
  try {
    const notlar = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notlar);
  } catch (error) {
    console.error('Notları getirirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /api/notlar - Yeni not ve fotoğraf ekle
app.post('/api/notlar', upload.single('fotograf'), async (req, res) => {
  try {
    const { metin } = req.body;
    let fotografUrl = null;

    if (req.file) {
      fotografUrl = req.file.path; // Cloudinary'ye yüklenen dosyanın URL'i
    }

    if (!metin) {
      return res.status(400).json({ message: 'Metin alanı zorunludur.' });
    }

    const yeniNot = new Note({
      metin,
      fotografUrl
    });

    const kaydedilenNot = await yeniNot.save();
    res.status(201).json(kaydedilenNot);
  } catch (error) {
    console.error('Not eklerken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

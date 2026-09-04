require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const Note = require('./models/Note');
const Plan = require('./models/Plan');
const DailyLog = require('./models/DailyLog');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://ozel-six.vercel.app', 
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// MongoDB Bağlantısı
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
mongoose.connect(uri)
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

// PUT /api/notlar/:id - Not güncelle
app.put('/api/notlar/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Hata' });
  }
});

// DELETE /api/notlar/:id - Not sil
app.delete('/api/notlar/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Hata' });
  }
});

// --- Plan Rotaları ---
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: 1 });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Hata' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const newPlan = new Plan(req.body);
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error('Plan kaydedilirken hata:', error);
    res.status(500).json({ message: 'Hata', error: error.message });
  }
});

app.put('/api/plans/:id', async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Hata' });
  }
});

app.delete('/api/plans/:id', async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Hata' });
  }
});

// --- Daily Rotaları ---
app.get('/api/daily/history', async (req, res) => {
  try {
    const history = await DailyLog.find().sort({ date: 1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Hata' });
  }
});

app.post('/api/daily', async (req, res) => {
  try {
    const { date } = req.body;
    const existingLog = await DailyLog.findOne({ date });
    if (existingLog) {
      const updatedLog = await DailyLog.findOneAndUpdate({ date }, req.body, { new: true });
      return res.status(200).json(updatedLog);
    }
    const newLog = new DailyLog(req.body);
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    res.status(500).json({ message: 'Hata' });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

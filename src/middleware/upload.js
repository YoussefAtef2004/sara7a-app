import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../utils/errorClasses.js';

const MAGIC_NUMBERS = {
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  'image/png': ['89504e47'],
  'image/gif': ['47494638'],
};


const validateMagicNumber = (buffer, mimetype) => {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  const hex = buffer.toString('hex', 0, 4);
  const allowedMagicNumbers = MAGIC_NUMBERS[mimetype];

  if (!allowedMagicNumbers) {
    return false;
  }

  return allowedMagicNumbers.some(magic => hex.startsWith(magic));
};

const ensureUploadDirs = () => {
  const dirs = [
    'src/uploads',
    'src/uploads/profiles',
    'src/uploads/covers',
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadDirs();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'src/uploads';
    
    if (file.fieldname === 'profileImage') {
      folder = 'src/uploads/profiles';
    } else if (file.fieldname === 'coverImage') {
      folder = 'src/uploads/covers';
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new ValidationError('Invalid file type. Only JPEG and PNG images are allowed'),
      false
    );
  }


  cb(null, true);
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});


const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const buffer = fs.readFileSync(req.file.path);
    const isValid = validateMagicNumber(buffer, req.file.mimetype);

    if (!isValid) {
      fs.unlinkSync(req.file.path);
      throw new ValidationError(
        'Invalid file format. File content does not match the declared type'
      );
    }

    next();
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};


const validateUploadedFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    for (const file of req.files) {
      const buffer = fs.readFileSync(file.path);
      const isValid = validateMagicNumber(buffer, file.mimetype);

      if (!isValid) {
        req.files.forEach(f => {
          if (fs.existsSync(f.path)) {
            fs.unlinkSync(f.path);
          }
        });
        
        throw new ValidationError(
          `Invalid file format for ${file.originalname}. File content does not match the declared type`
        );
      }
    }

    next();
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};


const deleteUploadedFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
};

export {
  upload,
  validateUploadedFile,
  validateUploadedFiles,
  deleteUploadedFile,
  validateMagicNumber,
};

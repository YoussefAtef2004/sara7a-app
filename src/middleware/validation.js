import { ValidationError } from '../utils/errorClasses.js';


const validate = (schema) => {
  return (req, res, next) => {
    try {
      const dataToValidate = {
        ...(schema.body && { body: req.body }),
        ...(schema.params && { params: req.params }),
        ...(schema.query && { query: req.query }),
        ...(schema.file && req.file && { file: req.file }),
        ...(schema.files && req.files && { files: req.files }),
      };

      const errors = [];

      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        
        if (error) {
          errors.push(...error.details);
        } else {
          req.body = value;
        }
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        
        if (error) {
          errors.push(...error.details);
        } else {
          req.params = value;
        }
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        
        if (error) {
          errors.push(...error.details);
        } else {
          req.query = value;
        }
      }

      if (schema.file && req.file) {
        const { error } = schema.file.validate(req.file, {
          abortEarly: false,
        });
        
        if (error) {
          errors.push(...error.details);
        }
      }

      if (schema.files && req.files) {
        const { error } = schema.files.validate(req.files, {
          abortEarly: false,
        });
        
        if (error) {
          errors.push(...error.details);
        }
      }

      if (errors.length > 0) {
        const details = errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        throw new ValidationError('Validation failed', details);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;

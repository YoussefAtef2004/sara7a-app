import mongoose from 'mongoose';

const revokedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  revokedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

revokedTokenSchema.index({ token: 1 });
revokedTokenSchema.index({ userId: 1 });

const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);

export default RevokedToken;

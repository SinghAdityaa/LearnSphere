
import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
      default: null
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 3000
    },

    isResolved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

discussionSchema.index({
  course: 1,
  parent: 1,
  createdAt: -1
});

export default mongoose.models.Discussion ||
  mongoose.model('Discussion', discussionSchema);

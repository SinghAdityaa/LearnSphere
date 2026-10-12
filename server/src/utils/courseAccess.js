export function publicCourse(course) {
  const doc = typeof course.toObject === 'function' ? course.toObject({ virtuals: true }) : structuredClone(course);
  doc.modules = (doc.modules || []).map(module => ({
    ...module,
    lessons: (module.lessons || []).map(lesson => ({
      _id: lesson._id,
      title: lesson.title,
      duration: lesson.duration,
      isPreview: Boolean(lesson.isPreview),
      // All actual media stays behind the authenticated, enrolled endpoint.
    }))
  }));
  return doc;
}

export function canEnrollFree(course) {
  return course?.isPublished === true && course?.accessType !== 'paid';
}

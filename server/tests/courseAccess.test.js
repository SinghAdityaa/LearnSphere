import test from 'node:test';
import assert from 'node:assert/strict';
import { publicCourse, canEnrollFree } from '../src/utils/courseAccess.js';

test('public catalog never leaks lecture media or downloadable resources', () => {
  const input = { title: 'Course', isPublished: true, accessType: 'paid', modules: [{ title: 'Chapter', lessons: [{ _id: '1', title: 'Lecture', duration: 10, videoUrl: 'https://secret.example/video', content: 'private notes', resources: [{ url: 'https://secret.example/pdf' }], isPreview: true }] }] };
  const output = publicCourse(input);
  assert.equal(output.modules[0].lessons[0].title, 'Lecture');
  assert.equal(JSON.stringify(output).includes('secret.example'), false);
  assert.equal(JSON.stringify(output).includes('private notes'), false);
});
test('only published free courses can be enrolled in before payments launch', () => {
  assert.equal(canEnrollFree({ isPublished: true, accessType: 'free' }), true);
  assert.equal(canEnrollFree({ isPublished: false, accessType: 'free' }), false);
  assert.equal(canEnrollFree({ isPublished: true, accessType: 'paid' }), false);
});

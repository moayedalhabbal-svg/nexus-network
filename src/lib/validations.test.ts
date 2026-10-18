import test from 'node:test';
import assert from 'node:assert/strict';

import { applicationSchema, postSchema, projectSchema } from './validations';

test('demo and seeded ids are accepted for demo-mode flows', () => {
  const projectResult = projectSchema.safeParse({
    title: 'Demo project',
    pitch: 'This is a demo project pitch.',
    description: 'This is a longer demo project description that is long enough to pass validation.',
    stage: 'idea',
    category: 'ai',
    is_private: false,
  });

  const applicationResult = applicationSchema.safeParse({
    project_id: 'proj-1',
    need_id: 'need-1',
    message: 'This is a meaningful project pitch for the demo flow.',
  });

  const postResult = postSchema.safeParse({
    content: 'Looks good for the demo flow.',
    project_ref: 'proj-1',
  });

  assert.equal(projectResult.success, true);
  assert.equal(applicationResult.success, true);
  assert.equal(postResult.success, true);
});

test('real UUID identifiers continue to be accepted', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';

  assert.equal(applicationSchema.safeParse({
    project_id: validUuid,
    need_id: validUuid,
    message: 'This is a real UUID-based application with a proper pitch.',
  }).success, true);

  assert.equal(postSchema.safeParse({
    content: 'This is a real UUID-based post.',
    project_ref: validUuid,
  }).success, true);
});

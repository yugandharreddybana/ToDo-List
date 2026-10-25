import test from 'node:test';
import assert from 'node:assert/strict';
import { proposalInput, requiredQuestions, buildPlan, parseAiDecision } from '../src/services/plan-proposal.ts';

const taskId = '11111111-1111-4111-8111-111111111111';
const commitmentId = '22222222-2222-4222-8222-222222222222';
function context(overrides: Record<string, unknown> = {}) {
  return proposalInput.parse({
    date: '2026-10-26', isToday: true, currentTime: '20:00',
    tasks: [{ id: taskId, title: 'Prepare presentation', estimatedMinutes: 25, priority: 'HIGH' }],
    commitments: [], commitmentsConfirmed: true,
    preferences: { windowStart: '06:00', windowEnd: '21:00', bufferMinutes: 5, focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 },
    ...overrides,
  });
}

test('late-day planning starts 15 minutes after current time', () => {
  const input = context();
  assert.deepEqual(requiredQuestions(input), []);
  const plan = buildPlan(input, { orderedTaskIds: [taskId], summary: 'Important work first' });
  assert.equal(plan.windowStart, '20:15');
  assert.equal(plan.items[0].startTime, '20:15');
  assert.equal(plan.items[0].endTime, '20:40');
});

test('fixed commitments remain protected', () => {
  const input = context({ isToday: false, currentTime: '05:00', commitments: [{ id: commitmentId, title: 'Meeting', startTime: '06:00', endTime: '07:00', recurring: false, date: '2026-10-26', daysOfWeek: [], flexible: false }] });
  const plan = buildPlan(input, { orderedTaskIds: [taskId] });
  assert.equal(plan.items[0].itemType, 'commitment');
  assert.equal(plan.items[1].startTime, '07:00');
});

test('overcapacity produces a clarification question', () => {
  const input = context({ tasks: [{ id: taskId, title: 'Long task', estimatedMinutes: 60, priority: 'HIGH' }] });
  assert.match(requiredQuestions(input)[0], /exceed/);
});

test('unknown model task identifiers are rejected', () => {
  const input = context();
  assert.throws(() => parseAiDecision('{"orderedTaskIds":["33333333-3333-4333-8333-333333333333"]}', input));
});

test('urgent work remains first even when the model suggests a low-priority task', () => {
  const lowId = '44444444-4444-4444-8444-444444444444';
  const input = context({ isToday: false, currentTime: '05:00', tasks: [
    { id: taskId, title: 'Urgent work', estimatedMinutes: 25, priority: 'URGENT' },
    { id: lowId, title: 'Optional work', estimatedMinutes: 25, priority: 'LOW' },
  ] });
  const plan = buildPlan(input, { orderedTaskIds: [lowId, taskId] });
  assert.equal(plan.items.find(item => item.itemType === 'task')?.taskId, taskId);
  assert.ok(plan.items.some(item => item.itemType === 'break'));
});

test('a full window cannot silently omit recovery breaks', () => {
  const input = context({ isToday: false, currentTime: '05:00', preferences: { windowStart: '06:00', windowEnd: '06:50', bufferMinutes: 0, focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 },
    tasks: [{ id: taskId, title: 'Long task', estimatedMinutes: 50, priority: 'HIGH' }] });
  assert.throws(() => buildPlan(input, {}), /cannot fit/);
});

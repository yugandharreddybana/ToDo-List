import http from 'node:http';

const port = Number(process.env.MOCK_NVIDIA_PORT ?? 55433);
http.createServer(async (req, res) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  const prompt = JSON.parse(body).messages?.at(-1)?.content ?? '';
  let content;
  if (prompt.includes('measured productivity data') || prompt.includes('measured productivity metrics')) {
    content = JSON.stringify({ rating: 6, wentWell: ['Logged focus time'], improve: ['Plan more realistically'], nextSteps: ['Review tomorrow\'s priorities'], explanation: 'Synthetic report.' });
  } else if (prompt.includes('energy-aware task ordering')) {
    const id = prompt.match(/"id":"([a-f0-9-]{36})"/)?.[1];
    content = JSON.stringify({ orderedTaskIds: id ? [id] : [], summary: 'High-priority work first.', assumptions: [] });
  } else {
    content = JSON.stringify([{ title: 'Synthetic extracted task', priority: 'MEDIUM', durationMinutes: 25 }]);
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ choices: [{ message: { content } }] }));
}).listen(port, '127.0.0.1');

const { spawn } = require('child_process');

const port = process.env.PORT || 3000;
console.log(`Starting server on port ${port}...`);

const serve = spawn('npx', ['serve', '-s', 'dist', '-l', port], {
  stdio: 'inherit',
  shell: true
});

serve.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

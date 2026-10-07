export const starter = `// Mi primer proyecto EV3 · JavaScript
// Prueba primero sin mover motores.
log("¡Hola, EV3!");
await robot.tone(440, 300);

// Conecta un motor al puerto A y descomenta:
// await robot.motor("A", 30, 1000);
`;
export const snippets = {
  'Motor': 'await robot.motor("A", 30, 1000);\n',
  'Sonido': 'await robot.tone(440, 300);\n',
  'Repetición': 'for (let vuelta = 0; vuelta < 3; vuelta++) {\n  log(vuelta);\n  await wait(1000);\n}\n',
  'Sensor de distancia': 'log(await robot.sensor(1, "distance")); // cm\n',
  'Sensor de color': 'log(await robot.sensor(2, "color")); // 0–7\n',
  'Sensor de contacto': 'log(await robot.sensor(3, "touch")); // 0 o 1\n',
  'Giroscopio': 'log(await robot.sensor(4, "gyro")); // grados\n',
  'Detener motores': 'await robot.stop();\n',
};
export function loadProjects(storage) {
  try {
    const data = JSON.parse(storage.getItem('copilli-lego-projects') || '[]');
    return Array.isArray(data) ? data.filter(p => typeof p.id === 'string' && typeof p.name === 'string' && typeof p.code === 'string') : [];
  } catch { return []; }
}
export function saveProjects(storage, projects) { storage.setItem('copilli-lego-projects', JSON.stringify(projects)); }

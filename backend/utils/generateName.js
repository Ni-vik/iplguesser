export function generateRandomName() {
  const adjectives = ["Cool", "Witty", "Happy", "Zesty", "Jolly"];
  const animals = ["Tiger", "Panda", "Fox", "Lion", "Otter"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(100 + Math.random() * 900);
  return `${adj}-${animal}-${number}`;
}

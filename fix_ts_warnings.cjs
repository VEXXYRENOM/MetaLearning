const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'src/components/experience/Procedural3DObject.tsx', regex: /const ocean =/g, replace: '// const ocean =' },
  { file: 'src/components/lesson/ColorWheel3D.tsx', regex: /const midAngle =.*?;/g, replace: '' },
  { file: 'src/components/lesson/ColorWheel3D.tsx', regex: /const midR =.*?;/g, replace: '' },
  { file: 'src/components/lesson/FunctionGraph3D.tsx', regex: /const currZ = [^;]+;/g, replace: '' },
  { file: 'src/components/lesson/MathematicalLogic3D.tsx', regex: /useFrame\(\(state, delta\) =>/g, replace: 'useFrame((_state, _delta) =>' },
  { file: 'src/components/lesson/MathematicalLogic3D.tsx', regex: /useFrame\(\(state\)/g, replace: 'useFrame((_state)' },
  { file: 'src/components/lesson/OrthographicProjection3D.tsx', regex: /useFrame\(\(state\)/g, replace: 'useFrame((_state)' },
  { file: 'src/components/lesson/ParallaxDepthVolume.tsx', regex: /useRef, useMemo/g, replace: 'useRef' },
  { file: 'src/components/lesson/Pyramid3D.tsx', regex: /useFrame\(\(state\)/g, replace: 'useFrame((_state)' },
  { file: 'src/components/lesson/RobotKinematics3D.tsx', regex: /useState, useMemo/g, replace: 'useState' },
  { file: 'src/components/lesson/RobotKinematics3D.tsx', regex: /useFrame\(\(state\)/g, replace: 'useFrame((_state)' },
  { file: 'src/components/lesson/Sequences3D.tsx', regex: /useFrame\(\(state\)/g, replace: 'useFrame((_state)' },
  { file: 'src/components/lesson/Vectors3D.tsx', regex: /useFrame\(\(state\)/g, replace: 'useFrame((_state)' },
  { file: 'src/services/freeAiEngine.ts', regex: /const keywordToEmoji[^{]+{[^}]+};/s, replace: '' },
  { file: 'src/services/freeAiEngine.ts', regex: /accent: string/g, replace: '_accent: string' }
];

for (const req of replacements) {
  const fullPath = path.join(__dirname, req.file);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(req.regex, req.replace);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Replaced in ${req.file}`);
  } catch (e) {
    console.error(`Failed ${req.file}: ${e.message}`);
  }
}

const fs = require("fs");
const path = require("path");

function getAllTargetFolders(rootFolders) {
  const result = [];

  function traverse(folderPath) {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    const files = entries.filter(entry => entry.isFile());
    const dirs = entries.filter(entry => entry.isDirectory());

    if (files.length > 0 && dirs.length === 0) {
      const jsFiles = files.filter(file => path.extname(file.name) === ".js");
      if (jsFiles.length > 0) {
        result.push({
          folder: folderPath,
          jsCount: jsFiles.length
        });
      }
    }

    for (const dir of dirs) {
      traverse(path.join(folderPath, dir.name));
    }
  }

  for (const root of rootFolders) {
    traverse(root);
  }

  return result;
}

function splitFoldersEvenly(array, n) {
  const result = Array.from({ length: n }, () => []);

  for (let i = 0; i < array.length; i++) {
    result[i % n].push(array[i]);
  }

  return result;
}

const rootFolders = [
  path.join(__dirname, "A"),
  path.join(__dirname, "B")
];

const N = 2;

const targetFolders = getAllTargetFolders(rootFolders);

console.log("Папки с .js файлами:");
for (const folder of targetFolders) {
  console.log(`${folder.folder} (${folder.jsCount})`);
}

const split = splitFoldersEvenly(targetFolders, N);

console.log("Результат деления на группы:");
split.forEach((group, index) => {
  console.log(`[${index + 1}]`);
  group.forEach(folder => {
    console.log(`${folder.folder} (${folder.jsCount})`);
  });
});



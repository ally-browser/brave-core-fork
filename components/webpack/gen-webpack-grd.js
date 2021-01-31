const path = require('path')
const fs = require('mz/fs')

function getIncludesString (idPrefix, fileList) {
  let includesString = ''
  for (const relativeFilePath of fileList) {
    const fileId = idPrefix + relativeFilePath.replace(/[^a-z0-9]/gi, '_').toUpperCase()
    includesString += `<include name="${fileId}" file="${relativeFilePath}" type="BINDATA" />
`
}
  return includesString
}

// Returns Promise<string[]>
async function getFileListDeep (dirPath) {
  const dirItems = await fs.readdir(dirPath)
  // get Array<string | string[]> of contents
  const dirItemGroups = await Promise.all(dirItems.map(
    async (dirItemRelativePath) => {
      const itemPath = path.join(dirPath, dirItemRelativePath)
      const stats = await fs.stat(itemPath)
      if (stats.isDirectory()) {
        return await getFileListDeep(itemPath)
      }
      if (stats.isFile()) {
        return itemPath
      }
    }
  ))
  // flatten to single string[]
  return dirItemGroups.reduce(
    (flatList, dirItemGroup) => flatList.concat(dirItemGroup),
    []
  )
}

async function createDynamicGDR (name, grdName, idPrefix, targetDir) {
  // normalize path so relative path ignores leading path.sep
  if (!targetDir.endsWith(path.sep)) {
    targetDir += path.sep
  }
  const gdrPath = path.join(targetDir, grdName)
  // remove previously generated file
  try {
    await fs.unlink(gdrPath)
  } catch (e) {}
  // build file list from target dir
  const filePaths = await getFileListDeep(targetDir)
  const relativeFilePaths = filePaths.map(filePath => filePath.replace(targetDir, ''))
  // get gdr string
  const gdrFileContents = getGrdString(name, idPrefix, relativeFilePaths)
  // write to file
  await fs.writeFile(gdrPath, gdrFileContents, { encoding: 'utf8' })
}

// collect args
const resourceName = process.env.RESOURCE_NAME
const idPrefix = process.env.ID_PREFIX
const targetDir = process.env.TARGET_DIR
const grdName = process.env.GRD_NAME

if (!targetDir) {
  throw new Error("TARGET_DIR env variable is required!")
}
if (!idPrefix) {
  throw new Error("ID_PREFIX env variable is required!")
}
if (!resourceName) {
  throw new Error("RESOURCE_NAME env variable is required!")
}
if (!grdName) {
  throw new Error("GRD_NAME env variable is required!")
}

// main
createDynamicGDR(resourceName, grdName, idPrefix, targetDir)
.catch(err => {
  console.error(err)
  process.exit(1)
})

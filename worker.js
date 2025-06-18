self.onmessage = function (e) {
  const file = e.data.file;
  if (!file) {
    postMessage({ type: 'error', data: 'No file provided.' });
    return;
  }

  const chunkSize = 1024 * 1024; // 1 MB
  const reader = new FileReader();
  let offset = 0;
  let chunks = [];

  const readChunk = () => {
    const slice = file.slice(offset, offset + chunkSize);
    reader.readAsArrayBuffer(slice);
  };

  reader.onload = () => {
    const binary = new Uint8Array(reader.result);
    let binaryStr = '';
    for (let i = 0; i < binary.length; i++) {
      binaryStr += String.fromCharCode(binary[i]);
    }
    chunks.push(btoa(binaryStr));

    offset += chunkSize;
    const percent = Math.floor((offset / file.size) * 100);
    postMessage({ type: 'progress', data: percent });

    if (offset < file.size) {
      readChunk();
    } else {
      postMessage({ type: 'result', data: chunks.join('') });
    }
  };

  reader.onerror = () => {
    postMessage({ type: 'error', data: 'Failed to read file.' });
  };

  readChunk();
};

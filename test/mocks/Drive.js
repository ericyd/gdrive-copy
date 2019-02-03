import * as fs from 'fs';

const mockFile = JSON.parse(
  fs.readFileSync('test/mocks/copy_file_response_200.json').toString()
);

const Drive = {
  Files: {
    get: id => {
      if (id == mockFile.id) {
        return mockFile;
      }
    }
  }
};

export default Drive;

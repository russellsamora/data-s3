# data-S3
Simple interface to deal with data on s3 built on top of the Node AWS SDK. 

### Installation
`npm install data-s3`

### Supported Data Formats
* **JSON**
* **CSV**
* **TSV**

### Usage

```js
const dataS3 = require('data-s3');

const accessKeyId = 'your aws key';
const secretAccessKey = 'your aws secret';

// initialize
dataS3.init({ accessKeyId, secretAccessKey, region });

// upload data
try {
  const data = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }];
  const result = await dataS3.upload({ bucket: 'bucket-name', path: 'path/to/folder' file: 'test.csv', data });
  console.log(result);
} catch (err) {
  console.log(err);
}

// download data
try {
  const data = await dataS3.download({ bucket: 'bucket-name', path: 'path/to/folder' file: 'test.csv' });
  console.log(data);
} catch (err) {
  console.log(err);
}

// file exists check
try {
  const exists = await dataS3.exists({ bucket: 'bucket-name', path: 'path/to/folder' file: 'test.csv' });
  console.log(exists);
} catch (err) {
  console.log(err);
}

// list files in direcotry
try {
  const list = await dataS3.list({ bucket: 'bucket-name', path: 'path/to/folder' });
  console.log(list);
} catch (err) {
  console.log(err);
}
```

### API
All methods (except `init`) can be either async/await or thenable promises).

<a name="init" href="#init">#</a> *dataS3*.**init**({ accessKeyId, secretAccessKey, required })

Initialize the AWS S3 config credentials. All parameters are required.

<a name="upload" href="#upload">#</a> *dataS3*.**upload**({ bucket, path, file, data })

Uploads some data to a specific bucket path and filename (eg. file.csv). Returns "success" on completion.

<a name="download" href="#download">#</a> *dataS3*.**download**({ bucket, path, file })

Downloads a specific file from a bucket path. Returns the data, parsed.

<a name="exists" href="#exists">#</a> *dataS3*.**exists**({ bucket, path, file })

Checks to see if a file from a bucket path exists. Returns `true` or `false`.

<a name="list" href="#list">#</a> *dataS3*.**list**({ bucket, path })

Lists the files in a bucket directory. Returns an array of filenames.

### Contributors 
* [russellgoldenberg](https://github.com/russellgoldenberg)

### License

MIT License

Copyright (c) 2019 Russell Goldenberg

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

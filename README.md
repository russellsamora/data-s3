# data-S3
Simple interface to deal with data on s3 built on top of the Node AWS SDK. 

### Installation
`npm install data-s3`

### Usage

```javascript
require('dotenv').config();
const dataS3 = require('data-s3');

const accessKeyId = process.env.AWS_KEY;
const secretAccessKey = process.env.AWS_SECRET;

// initialize
dataS3.init({ accessKeyId, secretAccessKey });

// upload data
const data = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }];
const result = await dataS3.upload({ bucket: 'bucket-name', file: 'test.csv', data });
console.log(result);

// download data
const data = await dataS3.download({ bucket: 'bucket-name', file: 'test.csv' });
console.log(data);
```

### API
#### dataS3.init([options])
- `accessKeyId` **required**
- `secretAccessKey` **required**

#### dataS3.upload([options])
- `bucket` **required**
- `file` **required**

#### dataS3.download([options])
- `bucket` **required**
- `file` **required**
- `data` **required**

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

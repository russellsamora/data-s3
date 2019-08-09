const AWS = require('aws-sdk');
const dsv = require('d3-dsv');

const s3 = new AWS.S3();

// private
function getFormat(file) {
	return new Promise((resolve, reject) => {
		const supported = ['csv', 'tsv', 'json'];
		try {
			const s = file.split('.');
			if (s.length) {
				const f = s.pop();
				if (supported.includes(f)) resolve(f);
				else reject(`unsupported format: ${f}`);
			} else reject('no extension in filename');
		} catch (err) {
			reject(`issue parsing format from ${file}`);
		}
	});
}

function stringify({ data, format }) {
	return new Promise((resolve, reject) => {
		try {
			let output = null;
			if (format === 'csv') output = dsv.csvFormat(data);
			if (format === 'tsv') output = dsv.tsvFormat(data);
			if (format === 'json') output = JSON.stringify(data);
			resolve(output);
		} catch (err) {
			reject(`issue stringifying data as a ${format}`);
		}
	});
}

function parse({ buffer, format }) {
	return new Promise((resolve, reject) => {
		try {
			const str = buffer.toString('utf8');
			let output = null;
			if (format === 'csv') output = dsv.csvParse(str);
			if (format === 'tsv') output = dsv.tsvParse(str);
			if (format === 'json') output = JSON.parse(str);
			resolve(output);
		} catch (err) {
			reject(`issue parsing data as a ${format}`);
		}
	});
}

// public
async function upload({ bucket, file, data }) {
	return new Promise (async (resolve, reject) => {
		if (!bucket || !file || !data) reject('missing parameters');
		else {
			try {
				const format = await getFormat(file);
				const body = await stringify({ data, format });
				
				const params = {
					Bucket: bucket,
					Body: body,
					Key: file
				};

				s3.upload(params, (err, data) => {
					if (err) reject(`${err.statusCode} ${err.message}`);
					else if (data) resolve(data);
					else reject('no data');
				});
			} catch(err) {
				reject(err);
			}	
		}
	});
}

function download({ bucket, file }) {
	return new Promise(async (resolve, reject) => {
		if (!bucket || !file) reject('missing parameters');
		else {
			try {
				const format = await getFormat(file);

				const params = {
					Bucket: bucket,
					Key: file
				};

				s3.getObject(params, async (err, resp) => {
					if (err) reject(`${err.statusCode} ${err.message}`);
					else if (resp) {
						const buffer = resp.Body;
						const data = await parse({ buffer, format });
						resolve(data);
					} else reject('no response');
				});
			} catch (err) {
				reject(err);
			}
		}
	});
}

function exists() {

}

function init({ accessKeyId, secretAccessKey }) {
	AWS.config.update({ accessKeyId, secretAccessKey });
}

module.exports = { init, upload, download, exists };

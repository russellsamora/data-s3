const AWS = require('aws-sdk');
const dsv = require('d3-dsv');

const s3 = new AWS.S3();
let configured = false;

// private
function getFormat(file) {
	const supported = ['csv', 'tsv', 'json'];
	try {
		const s = file.split('.');
		if (s.length) {
			const f = s.pop();
			if (supported.includes(f)) return Promise.resolve(f);
			return Promise.reject(`unsupported format: ${f}`);
		}
		return Promise.reject('no extension in filename');
	} catch (err) {
		return Promise.reject(err.message);
	}
}

function stringify({ data, format }) {
	try {
		let output = null;
		if (format === 'csv') output = dsv.csvFormat(data);
		if (format === 'tsv') output = dsv.tsvFormat(data);
		if (format === 'json') output = JSON.stringify(data);
		return Promise.resolve(output);
	} catch (err) {
		return Promise.reject(`issue stringifying data as a ${format}`);
	}
}

function parse({ buffer, format }) {
	try {
		const str = buffer.toString('utf8');
		let output = null;
		if (format === 'csv') output = dsv.csvParse(str);
		if (format === 'tsv') output = dsv.tsvParse(str);
		if (format === 'json') output = JSON.parse(str);
		return Promise.resolve(output);
	} catch (err) {
		return Promise.reject(`issue parsing data as a ${format}`);
	}
}

function trimSlash(str) {
	const s = str.startsWith('/');
	const e = str.endsWith('/');
	return str.substring(s ? 1 : 0).slice(0, e ? -1 : str.length);
}

function uploadS3(params) {
	return new Promise((resolve, reject) => {
		s3.upload(params, (err, data) => {
			if (err) reject(`${err.statusCode} ${err.message}`);
			else if (data) resolve('success');
			else reject('no data');
		});
	});
}

function downloadS3(params) {
	return new Promise((resolve, reject) => {
		s3.getObject(params, async (err, resp) => {
			if (err) reject(`${err.statusCode} ${err.message}`);
			else if (resp) {
				try {
					const format = await getFormat(params.Key);
					const buffer = resp.Body;
					const data = await parse({ buffer, format });
					resolve(data);
				} catch (err) {
					reject(err);
				}
			} else reject('no response');
		});
	});
}

function existsS3(params) {
	return new Promise((resolve, reject) => {
		s3.headObject(params, (err, resp) => {
			if (err && err.statusCode === 404) resolve(false);
			else if (resp) resolve(true);
			else reject('error fetching file');
		});
	});
}

function listS3(params) {
	return new Promise((resolve, reject) => {
		s3.listObjectsV2(params, (err, resp) => {
			if (err && err.statusCode === 404) resolve(false);
			else if (resp) {
				const files = resp.Contents.map(d => d.Key.replace(`${params.Prefix}/` ,'')).filter(d => d);
				resolve(files);
			}	else reject('error listing files');
		});
	});
}

// public
async function upload({ bucket, path = '', file, data }) {
	if (!configured) return Promise.reject('data-s3 not intialized');
	if (!bucket || !file || !data) return Promise.reject('missing parameters');

	try {
		const format = await getFormat(file);
		const body = await stringify({ data, format });

		const params = {
			Bucket: `${bucket}/${trimSlash(path)}`,
			Body: body,
			Key: file
		};

		const result = await uploadS3(params);
		return Promise.resolve(result);
	} catch (err) {
		return Promise.reject(err);
	}
}

async function download({ bucket, path = '', file }) {
	if (!configured) return Promise.reject('data-s3 not intialized');
	if (!bucket || !file) return Promise.reject('missing parameters');

	try {	
		const params = {
			Bucket: `${bucket}/${trimSlash(path)}`,
			Key: file
		};

		const result = await downloadS3(params);
		return Promise.resolve(result);
	} catch (err) {
		return Promise.reject(err);
	}
}

async function exists({ bucket, path = '', file }) {
	try {
		if (!configured) return Promise.reject('data-s3 not intialized');
		if (!bucket || !file) return Promise.reject('missing parameters');
		
		const params = {
			Bucket: `${bucket}/${trimSlash(path)}`,
			Key: file
		};

		const e = await existsS3(params);
		return Promise.resolve(e);
	} catch (err) {
		return Promise.reject(err);
	}
}

async function list({ bucket, path = '' }) {
	try {
		if (!configured) return Promise.reject('data-s3 not intialized');
		if (!bucket) return Promise.reject('missing parameters');

		const params = {
			Bucket: bucket,
			Prefix: trimSlash(path)
		};

		const l = await listS3(params);
		return Promise.resolve(l);
	} catch (err) {
		return Promise.reject(err);
	}
}

function init({ accessKeyId, secretAccessKey, region }) {
	if (accessKeyId && secretAccessKey && region) {
		AWS.config.update({ accessKeyId, secretAccessKey, region });
		configured = true;
	} else console.log('data-s3 init: missing parameters');
}

module.exports = { init, upload, download, exists, list };

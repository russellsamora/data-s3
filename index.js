import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import * as dsv from "d3-dsv";

let s3 = null;

// private
function getFormat(file) {
  const supported = ["csv", "tsv", "json", "txt"];
  try {
    const s = file.split(".");
    if (s.length) {
      const f = s.pop();
      if (supported.includes(f)) return f;
      throw new Error(`unsupported format: ${f}`);
    }
    throw new Error("no extension in filename");
  } catch (err) {
    throw err;
  }
}

async function stringify({ data, format }) {
  try {
    let output = null;
    if (format === "csv") output = dsv.csvFormat(data);
    if (format === "tsv") output = dsv.tsvFormat(data);
    if (format === "json") output = JSON.stringify(data);
    if (format === "txt") output = data;
    return output;
  } catch (err) {
    throw new Error(`issue stringifying data as a ${format}`);
  }
}

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function parse({ stream, format }) {
  try {
    const buffer = await streamToBuffer(stream);
    const str = buffer.toString("utf8");
    let output = null;
    if (format === "csv") output = dsv.csvParse(str);
    if (format === "tsv") output = dsv.tsvParse(str);
    if (format === "json") output = JSON.parse(str);
    if (format === "txt") output = str;
    return output;
  } catch (err) {
    throw new Error(`issue parsing data as a ${format}`);
  }
}

function trimSlash(str) {
  const s = str.startsWith("/");
  const e = str.endsWith("/");
  return str.substring(s ? 1 : 0).slice(0, e ? -1 : str.length);
}

// public
async function upload({ bucket, path = "", file, data }) {
  if (!s3) throw new Error("data-s3 not intialized");
  if (!bucket || !file || !data) throw new Error("missing parameters");

  try {
    const format = await getFormat(file);
    const body = await stringify({ data, format });

    const params = {
      Bucket: `${bucket}`,
      Body: body,
      Key: `${trimSlash(path)}/${file}`,
    };

    await s3.send(new PutObjectCommand(params));
    return true;
  } catch (err) {
    throw err;
  }
}

async function download({ bucket, path = "", file }) {
  if (!s3) throw new Error("data-s3 not intialized");
  if (!bucket || !file) throw new Error("missing parameters");

  try {
    const params = {
      Bucket: bucket,
      Key: `${trimSlash(path)}/${file}`,
    };

    const { Body } = await s3.send(new GetObjectCommand(params));
    const stream = Body;
    const format = await getFormat(params.Key);
    const data = await parse({ stream, format });
    return data;
  } catch (err) {
    throw err;
  }
}

async function exists({ bucket, path = "", file }) {
  try {
    if (!s3) throw new Error("data-s3 not intialized");
    if (!bucket || !file) throw new Error("missing parameters");

    const params = {
      Bucket: `${bucket}`,
      Key: `${trimSlash(path)}/${file}`,
    };

    await s3.send(new HeadObjectCommand(params));
    return true;
  } catch (err) {
    if (err.name === "NotFound") {
      return false;
    } else {
      throw err;
    }
  }
}

async function list({ bucket, path = "" }) {
  try {
    if (!s3) throw new Error("data-s3 not intialized");
    if (!bucket) throw new Error("missing parameters");

    const params = {
      Bucket: bucket,
      Prefix: trimSlash(path),
    };

    const data = await s3.send(new ListObjectsV2Command(params));
    const files = data.Contents.map((d) =>
      d.Key.replace(`${params.Prefix}/`, "")
    ).filter((d) => d);
    return files;
  } catch (err) {
    throw err;
  }
}

async function init({ accessKeyId, secretAccessKey, region }) {
  const hasParams = accessKeyId && secretAccessKey && region;
  if (!region) throw new Error("data-s3 init: missing region");
  if (!accessKeyId || !secretAccessKey)
    throw new Error("data-s3 init: missing credentials");
  else {
    const credentials = {
      accessKeyId,
      secretAccessKey,
    };

    s3 = new S3Client({ region, credentials });
  }
  return;
}

export default { init, upload, download, exists, list };

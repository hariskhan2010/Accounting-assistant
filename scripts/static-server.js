const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..", "dist");
const port = Number(process.env.PORT || 8082);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

http
  .createServer((req, res) => {
    const requestedPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = path.join(root, requestedPath);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(root, "index.html");
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(500);
        res.end(String(error));
        return;
      }

      res.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
      });
      res.end(data);
    });
  })
  .listen(port, host, () => {
    console.log(`Static server listening at http://${host}:${port}`);
  });

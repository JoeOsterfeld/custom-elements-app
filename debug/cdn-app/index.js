const express = require('express');
const compression = require('compression')


const port = process.env.PORT || 8080;

const app = express();

app.use(compression());

const staticDir = `${__dirname}/client`;
app.use('/dist', express.static(`${__dirname}/../../dist`));
app.use(['/', '/*'], express.static(staticDir));

app.get('/*', (_req, res) => {
  res.sendFile(`${staticDir}/index.html`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
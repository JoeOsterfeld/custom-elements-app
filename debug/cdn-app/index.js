const express = require('express');
const compression = require('compression')


const port = process.env.PORT || 8080;

const app = express();

app.use(compression());

app.use('/dist', express.static(`${__dirname}/../../dist`));
app.use(['/', '/*'], express.static(`${__dirname}/client`));


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
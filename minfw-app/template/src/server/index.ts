import express from 'express';

const port = process.env.PORT || 8080;
const app = express();

app.use('*', (req, res) => {
  res.status(200).sendFile(`${__dirname}/client/index.html`);
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})

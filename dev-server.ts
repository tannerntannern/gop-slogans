import app from './api';

const port = 3000;
app.listen(port, () => {
    console.log(`Dev server running. Example URL: http://localhost:3000/api/image/0`);
});

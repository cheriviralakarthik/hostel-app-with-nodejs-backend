app = require("./app");
const { PORT } = process.env;

app.listen(PORT, () => console.log(`listening to the port ${PORT}`));

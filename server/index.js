const app = require("./app");

// Port.
const port = process.env.PORT || 4040;

// Listen on port.
app.listen(port, () => console.log(`Server started on port ${port}`));